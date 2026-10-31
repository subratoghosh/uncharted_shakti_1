import crypto from 'node:crypto';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import { AppError, ROUTES } from '@shaktiq/shared';
import { env } from '../../config/env.js';
import { getCollections } from '../../db/collections.js';
import { verifyGithubWebhookSignature } from '../../lib/hash.js';
import { logger } from '../../lib/logger.js';
import { sendError, sendSuccess } from '../../lib/response.js';
import { processRunAutonomously } from '../internal/background-runner.js';

export const eventRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // POST /webhooks/github
  app.post(ROUTES.WEBHOOKS.GITHUB, { config: { rawBody: true } }, async (request, reply) => {
    const deliveryId = request.headers['x-github-delivery'];
    const eventTypeHeader = request.headers['x-github-event'];
    const signatureHeader = request.headers['x-hub-signature-256'] as string | undefined;

    // 1. Validate signature
    const rawBody = (request as any).rawBody;
    const isValid = verifyGithubWebhookSignature(
      env.GITHUB_WEBHOOK_SECRET,
      rawBody,
      signatureHeader,
    );

    if (!isValid) {
      // Record rejected event per security.md section 1 & database.md section 3.4
      const { events } = getCollections();
      const rejectedDelivery = typeof deliveryId === 'string' ? deliveryId : crypto.randomUUID();
      const rejectedDoc = {
        _id: new ObjectId(),
        eventId: `rejected:${rejectedDelivery}`,
        projectId: null,
        eventType: 'github.push' as const,
        source: 'github' as const,
        receivedAt: new Date(),
        processingStatus: 'rejected' as const,
        duplicateCount: 0,
        error: 'INVALID_SIGNATURE',
      };

      try {
        await events.insertOne(rejectedDoc);
      } catch (e) {
        // Ignore duplicate rejection logs
      }

      logger.warn({ deliveryId, ip: request.ip }, 'Rejected webhook: invalid signature');
      return sendError(reply, 'INVALID_SIGNATURE', 'Invalid GitHub webhook signature', 401);
    }

    // 2. Validate required headers
    if (!deliveryId || typeof deliveryId !== 'string') {
      return sendError(reply, 'VALIDATION_ERROR', 'Missing X-GitHub-Delivery header', 400);
    }

    if (!eventTypeHeader || typeof eventTypeHeader !== 'string') {
      return sendError(reply, 'VALIDATION_ERROR', 'Missing X-GitHub-Event header', 400);
    }

    // 3. Handle ping
    if (eventTypeHeader === 'ping') {
      return sendSuccess(reply, { ping: 'pong' }, 200);
    }

    const payload = request.body as Record<string, any>;
    const { projects, events, runs } = getCollections();

    // 4. Handle GitHub App Installation events (1-click onboarding worldwide)
    if (eventTypeHeader === 'installation' || eventTypeHeader === 'installation_repositories') {
      const installationId = payload.installation?.id;
      const repos = payload.repositories || payload.repositories_added || [];

      if (Array.isArray(repos) && installationId) {
        logger.info(
          { action: payload.action, count: repos.length, installationId },
          'GitHub App installation event received: syncing repositories',
        );

        for (const repo of repos) {
          const fullName = (repo.full_name || '').toLowerCase();
          if (!fullName) continue;
          const [ownerPart, repoPart] = fullName.split('/');

          await projects.updateOne(
            { fullName },
            {
              $set: {
                name: repo.name || repoPart || fullName,
                fullName,
                owner: ownerPart || '',
                repo: repoPart || '',
                repositoryUrl: `https://github.com/${fullName}`,
                defaultBranch: repo.default_branch || 'main',
                specPath: 'openapi.yaml',
                installationId,
                updatedAt: new Date(),
              },
              $setOnInsert: {
                _id: new ObjectId(),
                ownerUserId: new ObjectId(),
                createdAt: new Date(),
              },
            },
            { upsert: true },
          );
        }
      }

      return sendSuccess(reply, { synced: true, count: repos.length }, 200);
    }

    // 5. Filter only push and pull_request
    if (eventTypeHeader !== 'push' && eventTypeHeader !== 'pull_request') {
      return sendSuccess(
        reply,
        { ignored: true, reason: `Ignored event: ${eventTypeHeader}` },
        202,
      );
    }

    if (!payload || typeof payload !== 'object' || !payload.repository?.full_name) {
      return sendError(
        reply,
        'VALIDATION_ERROR',
        'Malformed webhook payload or missing repository info',
        400,
      );
    }

    // If pull_request, only opened, synchronize, reopened
    if (eventTypeHeader === 'pull_request') {
      const allowedActions = ['opened', 'synchronize', 'reopened'];
      if (!allowedActions.includes(payload.action)) {
        return sendSuccess(
          reply,
          { ignored: true, reason: `Ignored PR action: ${payload.action}` },
          202,
        );
      }
    }

    // 6. Resolve or Auto-Onboard project by repository.full_name
    const repoFullName = payload.repository.full_name.toLowerCase();
    let project = await projects.findOne({ fullName: repoFullName });

    if (!project) {
      logger.info({ repoFullName }, 'New global repository detected via webhook; auto-onboarding project');
      const [ownerPart, repoPart] = repoFullName.split('/');
      const newProjectDoc = {
        _id: new ObjectId(),
        ownerUserId: new ObjectId(),
        name: payload.repository.name || repoPart || repoFullName,
        fullName: repoFullName,
        owner: ownerPart || '',
        repo: repoPart || '',
        repositoryUrl: payload.repository.html_url || `https://github.com/${repoFullName}`,
        defaultBranch: payload.repository.default_branch || 'main',
        specPath: 'openapi.yaml',
        installationId: payload.installation?.id || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await projects.insertOne(newProjectDoc);
      project = newProjectDoc;
    } else if (payload.installation?.id && !project.installationId) {
      await projects.updateOne({ _id: project._id }, { $set: { installationId: payload.installation.id } });
      project = { ...project, installationId: payload.installation.id };
    }

    const activeProject = project;

    // If push, ignore if non-default branch
    if (eventTypeHeader === 'push') {
      const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : '';
      if (branch && branch !== activeProject.defaultBranch) {
        return sendSuccess(
          reply,
          { ignored: true, reason: `Push ignored for non-default branch: ${branch}` },
          202,
        );
      }
    }

    // 6. Build eventId
    const eventId = `github:${deliveryId}`;

    // 7. Extract versions
    let previousVersion: string | null = null;
    let currentVersion = 'HEAD';
    let commitId: string | null = null;
    let branch = activeProject.defaultBranch;
    let pullRequestNumber: number | null = null;

    if (eventTypeHeader === 'push') {
      previousVersion = payload.before || null;
      currentVersion = payload.after || 'HEAD';
      commitId = payload.after || null;
      branch = payload.ref ? payload.ref.replace('refs/heads/', '') : activeProject.defaultBranch;
    } else if (eventTypeHeader === 'pull_request') {
      previousVersion = payload.pull_request?.base?.sha || null;
      currentVersion = payload.pull_request?.head?.sha || 'HEAD';
      commitId = payload.pull_request?.head?.sha || null;
      branch = payload.pull_request?.head?.ref || activeProject.defaultBranch;
      pullRequestNumber = payload.pull_request?.number || null;
    }

    // 8. Trimmed payload subset per security.md and database.md
    const trimmedPayload = {
      ref: payload.ref,
      before: payload.before,
      after: payload.after,
      repository: payload.repository?.full_name,
      pullRequestNumber,
      sender: payload.sender?.login,
    };

    const now = new Date();
    const eventDoc = {
      _id: new ObjectId(),
      eventId,
      projectId: activeProject._id,
      eventType: (eventTypeHeader === 'push' ? 'github.push' : 'github.pull_request') as any,
      source: 'github' as const,
      payload: trimmedPayload,
      receivedAt: now,
      processingStatus: 'dispatched' as const,
      runId: null as ObjectId | null,
      duplicateCount: 0,
      lastDuplicateAt: null,
      error: null,
    };

    // 9. Insert event idempotently
    try {
      await events.insertOne(eventDoc);
    } catch (err: any) {
      if (err.code === 11000) {
        // Duplicate webhook delivery!
        logger.warn({ eventId }, 'Duplicate webhook delivery detected');
        await events.updateOne(
          { eventId },
          {
            $inc: { duplicateCount: 1 },
            $set: { lastDuplicateAt: new Date() },
          },
        );

        const existingEvent = await events.findOne({ eventId });
        return sendSuccess(
          reply,
          {
            duplicate: true,
            eventId,
            runId: existingEvent?.runId?.toHexString() || null,
          },
          200,
        );
      }
      throw err;
    }

    // 10. Create run
    const runDoc = {
      _id: new ObjectId(),
      projectId: activeProject._id,
      eventId,
      source: 'github' as const,
      previousVersion,
      currentVersion,
      commitId,
      branch,
      pullRequestNumber,
      baseSnapshotId: null,
      headSnapshotId: null,
      baseSpecHash: null,
      headSpecHash: null,
      status: 'queued' as const,
      startedAt: null,
      completedAt: null,
      createdAt: now,
      summary: null,
      errorCode: null,
      errorMessage: null,
      aiStatus: 'disabled' as const,
      aiSummary: null,
    };

    try {
      await runs.insertOne(runDoc);
      await events.updateOne({ _id: eventDoc._id }, { $set: { runId: runDoc._id } });
    } catch (err: any) {
      if (err.code === 11000) {
        const existingRun = await runs.findOne({ eventId });
        return sendSuccess(
          reply,
          {
            duplicate: true,
            eventId,
            runId: existingRun?._id.toHexString(),
          },
          200,
        );
      }
      throw err;
    }

    // 11. Dispatch to n8n webhook (or fallback to autonomous execution)
    let dispatchedToN8n = false;
    try {
      const response = await fetch(env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shaktiq-webhook-token': env.N8N_WEBHOOK_TOKEN,
        },
        body: JSON.stringify({
          runId: runDoc._id.toHexString(),
          projectId: activeProject._id.toHexString(),
        }),
      });

      if (response.ok) {
        dispatchedToN8n = true;
      }
    } catch {
      // n8n offline or unreachable
    }

    if (!dispatchedToN8n) {
      logger.info(
        { runId: runDoc._id, repoFullName },
        'n8n workflow engine offline or unconfigured; launching autonomous in-process ShaktIQ analysis',
      );
      // Run autonomous analysis asynchronously in background
      processRunAutonomously(runDoc._id, activeProject).catch(err => {
        logger.error({ err, runId: runDoc._id }, 'Autonomous analysis error');
      });
    }

    return sendSuccess(
      reply,
      {
        duplicate: false,
        eventId,
        runId: runDoc._id.toHexString(),
      },
      202,
    );
  });
};
