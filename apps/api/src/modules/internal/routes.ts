import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import {
  AppError,
  internalRunAnalyzeRequestSchema,
  internalRunExplanationsRequestSchema,
  internalRunFailRequestSchema,
  internalRunNotificationsRequestSchema,
  ReleaseStatus,
  ROUTES,
  RunSummary,
} from '@shaktiq/shared';
import { env } from '../../config/env.js';
import { getCollections } from '../../db/collections.js';
import { sha256 } from '../../lib/hash.js';
import { logger } from '../../lib/logger.js';
import { sendSuccess } from '../../lib/response.js';
import { requireInternalKey } from '../../plugins/auth.js';
import { compareSpecs } from './analyzer-service.js';

export const internalRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // All internal routes require the secret internal API key
  app.addHook('preHandler', requireInternalKey);

  // POST /internal/runs/:runId/start
  app.post(ROUTES.INTERNAL.RUN_START, async (request, reply) => {
    const { runId } = request.params as { runId: string };
    if (!ObjectId.isValid(runId)) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const { runs, projects } = getCollections();
    const run = await runs.findOne({ _id: new ObjectId(runId) });
    if (!run) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const project = await projects.findOne({ _id: run.projectId });
    if (!project) {
      throw new AppError('NOT_FOUND', 'Project not found');
    }

    // Update status to running
    await runs.updateOne(
      { _id: run._id, status: 'queued' },
      { $set: { status: 'running', startedAt: new Date() } },
    );

    const specSource = run.source === 'github' ? ('github' as const) : ('snapshots' as const);

    return sendSuccess(reply, {
      runId: run._id.toHexString(),
      projectId: project._id.toHexString(),
      specSource,
      repo: {
        fullName: project.fullName,
        specPath: project.specPath,
      },
      baseRef: run.previousVersion || null,
      headRef: run.currentVersion,
      source: run.source,
      pullRequestNumber: run.pullRequestNumber || null,
      aiEnabled: env.AI_EXPLANATIONS_ENABLED,
    });
  });

  // POST /internal/runs/:runId/analyze
  app.post(ROUTES.INTERNAL.RUN_ANALYZE, async (request, reply) => {
    const { runId } = request.params as { runId: string };
    if (!ObjectId.isValid(runId)) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const body = internalRunAnalyzeRequestSchema.parse(request.body || {});
    const { runs, projects, specSnapshots, findings } = getCollections();

    const run = await runs.findOne({ _id: new ObjectId(runId) });
    if (!run) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const project = await projects.findOne({ _id: run.projectId });
    if (!project) {
      throw new AppError('NOT_FOUND', 'Project not found');
    }

    // Retrieve or store specs
    let baseContent = '';
    let headContent = '';
    let baseSnapshotId: ObjectId | null = run.baseSnapshotId || null;
    let headSnapshotId: ObjectId | null = run.headSnapshotId || null;
    let baseSpecHash: string | null = run.baseSpecHash || null;
    let headSpecHash: string | null = run.headSpecHash || null;

    if (body.base?.content) {
      baseContent = body.base.content;
      baseSpecHash = sha256(baseContent);
      const existingBase = await specSnapshots.findOne({ projectId: project._id, sha256: baseSpecHash });
      if (existingBase) {
        baseSnapshotId = existingBase._id;
      } else {
        const doc = {
          _id: new ObjectId(),
          projectId: project._id,
          sha256: baseSpecHash,
          format: baseContent.trim().startsWith('{') ? ('json' as const) : ('yaml' as const),
          sizeBytes: Buffer.byteLength(baseContent, 'utf-8'),
          content: baseContent,
          repo: project.fullName,
          path: project.specPath,
          commitSha: run.previousVersion || null,
          createdAt: new Date(),
        };
        await specSnapshots.insertOne(doc);
        baseSnapshotId = doc._id;
      }
    } else if (baseSnapshotId) {
      const snap = await specSnapshots.findOne({ _id: baseSnapshotId });
      baseContent = snap?.content || '';
    }

    if (body.head?.content) {
      headContent = body.head.content;
      headSpecHash = sha256(headContent);
      const existingHead = await specSnapshots.findOne({ projectId: project._id, sha256: headSpecHash });
      if (existingHead) {
        headSnapshotId = existingHead._id;
      } else {
        const doc = {
          _id: new ObjectId(),
          projectId: project._id,
          sha256: headSpecHash,
          format: headContent.trim().startsWith('{') ? ('json' as const) : ('yaml' as const),
          sizeBytes: Buffer.byteLength(headContent, 'utf-8'),
          content: headContent,
          repo: project.fullName,
          path: project.specPath,
          commitSha: run.currentVersion,
          createdAt: new Date(),
        };
        await specSnapshots.insertOne(doc);
        headSnapshotId = doc._id;
      }
    } else if (headSnapshotId) {
      const snap = await specSnapshots.findOne({ _id: headSnapshotId });
      headContent = snap?.content || '';
    }

    // Run analyzer
    const findingDrafts = await compareSpecs(baseContent, headContent, {
      projectId: project._id.toHexString(),
      previousVersion: run.previousVersion,
      currentVersion: run.currentVersion,
    });

    // Insert findings with ordered:false to ignore duplicate keys on retries
    const now = new Date();
    if (findingDrafts.length > 0) {
      const docsToInsert = findingDrafts.map((f) => ({
        _id: new ObjectId(),
        projectId: project._id,
        runId: run._id,
        fingerprint: f.fingerprint,
        previousVersion: run.previousVersion,
        currentVersion: run.currentVersion,
        endpoint: f.endpoint,
        method: f.method,
        changeType: f.changeType,
        severity: f.severity,
        ruleId: f.ruleId,
        description: f.description,
        impact: f.impact,
        recommendation: f.recommendation,
        aiExplanation: null,
        createdAt: now,
      }));

      try {
        await findings.insertMany(docsToInsert, { ordered: false });
      } catch (err: any) {
        if (err.code !== 11000 && !err.writeErrors) {
          throw err;
        }
      }
    }

    // Calculate summary counts
    let breaking = 0;
    let warning = 0;
    let info = 0;

    for (const f of findingDrafts) {
      if (f.severity === 'breaking') breaking++;
      else if (f.severity === 'warning') warning++;
      else if (f.severity === 'info') info++;
    }

    const total = findingDrafts.length;
    let releaseStatus: ReleaseStatus = 'safe';
    if (breaking > 0) releaseStatus = 'blocked';
    else if (warning > 0) releaseStatus = 'review';

    // Calculate diff against previous run on same branch
    const previousRun = await runs.findOne(
      {
        projectId: project._id,
        branch: run.branch,
        status: 'completed',
        _id: { $ne: run._id },
      },
      { sort: { createdAt: -1 } },
    );

    let newCount = total;
    let resolvedCount = 0;
    let unresolvedCount = 0;

    if (previousRun) {
      const prevFindings = await findings.find({ runId: previousRun._id }).toArray();
      const prevFingerprints = new Set(prevFindings.map((p) => p.fingerprint));
      const currentFingerprints = new Set(findingDrafts.map((c) => c.fingerprint));

      newCount = 0;
      unresolvedCount = 0;
      resolvedCount = 0;

      for (const fp of currentFingerprints) {
        if (prevFingerprints.has(fp)) {
          unresolvedCount++;
        } else {
          newCount++;
        }
      }

      for (const fp of prevFingerprints) {
        if (!currentFingerprints.has(fp)) {
          resolvedCount++;
        }
      }
    }

    const summary: RunSummary = {
      total,
      breaking,
      warning,
      info,
      releaseStatus,
      newCount,
      resolvedCount,
      unresolvedCount,
    };

    // Update run as completed
    await runs.updateOne(
      { _id: run._id },
      {
        $set: {
          status: 'completed',
          summary,
          baseSnapshotId,
          headSnapshotId,
          baseSpecHash,
          headSpecHash,
          completedAt: new Date(),
        },
      },
    );

    return sendSuccess(reply, {
      summary,
      findingCount: total,
      topFindings: findingDrafts.slice(0, 10),
    });
  });

  // POST /internal/runs/:runId/explanations
  app.post(ROUTES.INTERNAL.RUN_EXPLANATIONS, async (request, reply) => {
    const { runId } = request.params as { runId: string };
    if (!ObjectId.isValid(runId)) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const body = internalRunExplanationsRequestSchema.parse(request.body);
    const { runs, findings } = getCollections();

    if (body.runSummaryText) {
      await runs.updateOne(
        { _id: new ObjectId(runId) },
        {
          $set: {
            aiStatus: 'completed',
            aiSummary: body.runSummaryText,
          },
        },
      );
    }

    for (const item of body.findings) {
      await findings.updateOne(
        { runId: new ObjectId(runId), fingerprint: item.fingerprint },
        { $set: { aiExplanation: item.explanation } },
      );
    }

    return sendSuccess(reply, { updated: true });
  });

  // POST /internal/runs/:runId/notifications
  app.post(ROUTES.INTERNAL.RUN_NOTIFICATIONS, async (request, reply) => {
    const { runId } = request.params as { runId: string };
    if (!ObjectId.isValid(runId)) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const body = internalRunNotificationsRequestSchema.parse(request.body);
    const { runs, notifications } = getCollections();

    const run = await runs.findOne({ _id: new ObjectId(runId) });
    if (!run) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const doc = {
      _id: new ObjectId(),
      runId: run._id,
      projectId: run.projectId,
      channel: body.channel,
      status: body.status,
      target: body.target,
      responseCode: body.responseCode,
      error: body.error || null,
      createdAt: new Date(),
    };

    await notifications.insertOne(doc);
    return sendSuccess(reply, { id: doc._id.toHexString() }, 201);
  });

  // POST /internal/runs/:runId/fail
  app.post(ROUTES.INTERNAL.RUN_FAIL, async (request, reply) => {
    const { runId } = request.params as { runId: string };
    if (!ObjectId.isValid(runId)) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const body = internalRunFailRequestSchema.parse(request.body);
    const { runs } = getCollections();

    await runs.updateOne(
      { _id: new ObjectId(runId) },
      {
        $set: {
          status: 'failed',
          errorCode: body.errorCode,
          errorMessage: body.errorMessage,
          completedAt: new Date(),
        },
      },
    );

    return sendSuccess(reply, { failed: true });
  });
};
