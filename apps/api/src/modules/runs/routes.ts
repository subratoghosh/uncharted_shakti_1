import crypto from 'node:crypto';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import {
  AppError,
  compareRunsQuerySchema,
  createManualRunRequestSchema,
  paginationQuerySchema,
  ROUTES,
} from '@shaktiq/shared';
import { env } from '../../config/env.js';
import { getCollections } from '../../db/collections.js';
import { sha256 } from '../../lib/hash.js';
import { logger } from '../../lib/logger.js';
import { sendSuccess } from '../../lib/response.js';
import { authenticate, verifyProjectOwnership } from '../../plugins/auth.js';
import { analyzeRateLimiter, cacheGet, cacheSet, rateLimitGuard } from '../../lib/redis.js';
import { createComparePipeline } from './pipelines.js';

export const runRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // POST /projects/:projectId/runs (Manual run)
  app.post(
    ROUTES.RUNS.CREATE_MANUAL,
    { preHandler: [authenticate, rateLimitGuard(analyzeRateLimiter)] },
    async (request, reply) => {
    const user = request.user!;
    const { projectId } = request.params as { projectId: string };
    const body = createManualRunRequestSchema.parse(request.body);

    const project = await verifyProjectOwnership(projectId, user);
    const { specSnapshots, events, runs } = getCollections();

    const clientKey = (request.headers['idempotency-key'] as string) || crypto.randomUUID();
    const eventId = `manual:${clientKey}`;
    const now = new Date();

    // Store snapshots
    let baseSnapshotId: ObjectId | null = null;
    let baseSpecHash: string | null = null;

    if (body.baseSpec) {
      baseSpecHash = sha256(body.baseSpec);
      const existingBase = await specSnapshots.findOne({
        projectId: project.id,
        sha256: baseSpecHash,
      });
      if (existingBase) {
        baseSnapshotId = existingBase._id;
      } else {
        const baseDoc = {
          _id: new ObjectId(),
          projectId: project.id,
          sha256: baseSpecHash,
          format: body.baseSpec.trim().startsWith('{') ? ('json' as const) : ('yaml' as const),
          sizeBytes: Buffer.byteLength(body.baseSpec, 'utf-8'),
          content: body.baseSpec,
          repo: project.fullName,
          path: project.specPath,
          commitSha: body.baseRef || null,
          createdAt: now,
        };
        await specSnapshots.insertOne(baseDoc);
        baseSnapshotId = baseDoc._id;
      }
    }

    const headSpecHash = sha256(body.headSpec);
    let headSnapshotId: ObjectId | null = null;
    const existingHead = await specSnapshots.findOne({
      projectId: project.id,
      sha256: headSpecHash,
    });
    if (existingHead) {
      headSnapshotId = existingHead._id;
    } else {
      const headDoc = {
        _id: new ObjectId(),
        projectId: project.id,
        sha256: headSpecHash,
        format: body.headSpec.trim().startsWith('{') ? ('json' as const) : ('yaml' as const),
        sizeBytes: Buffer.byteLength(body.headSpec, 'utf-8'),
        content: body.headSpec,
        repo: project.fullName,
        path: project.specPath,
        commitSha: body.headRef,
        createdAt: now,
      };
      await specSnapshots.insertOne(headDoc);
      headSnapshotId = headDoc._id;
    }

    // Insert event
    const eventDoc = {
      _id: new ObjectId(),
      eventId,
      projectId: project.id,
      eventType: 'manual.analyze' as const,
      source: 'manual' as const,
      payload: { baseRef: body.baseRef, headRef: body.headRef },
      receivedAt: now,
      processingStatus: 'dispatched' as const,
      runId: null as ObjectId | null,
      duplicateCount: 0,
      lastDuplicateAt: null,
      error: null,
    };

    try {
      await events.insertOne(eventDoc);
    } catch (err: any) {
      if (err.code === 11000) {
        const existingEvent = await events.findOne({ eventId });
        return sendSuccess(
          reply,
          { duplicate: true, eventId, runId: existingEvent?.runId?.toHexString() },
          200,
        );
      }
      throw err;
    }

    // Insert run
    const runDoc = {
      _id: new ObjectId(),
      projectId: project.id,
      eventId,
      source: 'manual' as const,
      previousVersion: body.baseRef || null,
      currentVersion: body.headRef,
      commitId: null,
      branch: body.branch,
      pullRequestNumber: null,
      baseSnapshotId,
      headSnapshotId,
      baseSpecHash,
      headSpecHash,
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

    await runs.insertOne(runDoc);
    await events.updateOne({ _id: eventDoc._id }, { $set: { runId: runDoc._id } });

    // Trigger n8n
    try {
      fetch(env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shaktiq-webhook-token': env.N8N_WEBHOOK_TOKEN,
        },
        body: JSON.stringify({
          runId: runDoc._id.toHexString(),
          projectId: project.id.toHexString(),
        }),
      }).catch(e => logger.warn({ err: e }, 'Async dispatch to n8n failed for manual run'));
    } catch (e) {}

    return sendSuccess(
      reply,
      {
        id: runDoc._id.toHexString(),
        projectId: runDoc.projectId.toHexString(),
        eventId,
        status: runDoc.status,
        createdAt: runDoc.createdAt.toISOString(),
      },
      202,
    );
  });

  // GET /projects/:projectId/runs
  app.get(ROUTES.RUNS.LIST_BY_PROJECT, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { projectId } = request.params as { projectId: string };
    const query = paginationQuerySchema.parse(request.query);

    const project = await verifyProjectOwnership(projectId, user);
    const { runs } = getCollections();

    const skip = (query.page - 1) * query.limit;
    const [list, total] = await Promise.all([
      runs
        .find({ projectId: project.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .toArray(),
      runs.countDocuments({ projectId: project.id }),
    ]);

    return sendSuccess(
      reply,
      list.map(r => ({
        id: r._id.toHexString(),
        projectId: r.projectId.toHexString(),
        eventId: r.eventId,
        source: r.source,
        previousVersion: r.previousVersion,
        currentVersion: r.currentVersion,
        commitId: r.commitId,
        branch: r.branch,
        pullRequestNumber: r.pullRequestNumber,
        status: r.status,
        startedAt: r.startedAt?.toISOString() || null,
        completedAt: r.completedAt?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
        summary: r.summary,
        errorCode: r.errorCode,
        errorMessage: r.errorMessage,
        aiStatus: r.aiStatus,
        aiSummary: r.aiSummary,
      })),
      200,
      {
        page: query.page,
        limit: query.limit,
        total,
      },
    );
  });

  // GET /runs/:runId
  app.get(ROUTES.RUNS.GET, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { runId } = request.params as { runId: string };

    if (!ObjectId.isValid(runId)) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const cacheKey = `run:doc:${runId}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return sendSuccess(reply, cached);
    }

    const { runs } = getCollections();
    const run = await runs.findOne({ _id: new ObjectId(runId) });
    if (!run) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    await verifyProjectOwnership(run.projectId.toHexString(), user);

    const payload = {
      id: run._id.toHexString(),
      projectId: run.projectId.toHexString(),
      eventId: run.eventId,
      source: run.source,
      previousVersion: run.previousVersion,
      currentVersion: run.currentVersion,
      commitId: run.commitId,
      branch: run.branch,
      pullRequestNumber: run.pullRequestNumber,
      status: run.status,
      startedAt: run.startedAt?.toISOString() || null,
      completedAt: run.completedAt?.toISOString() || null,
      createdAt: run.createdAt.toISOString(),
      summary: run.summary,
      errorCode: run.errorCode,
      errorMessage: run.errorMessage,
      aiStatus: run.aiStatus,
      aiSummary: run.aiSummary,
    };

    if (run.status === 'completed' || run.status === 'failed') {
      await cacheSet(cacheKey, payload, 600);
    }

    return sendSuccess(reply, payload);
  });

  // GET /runs/:runId/findings
  app.get(ROUTES.RUNS.FINDINGS, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { runId } = request.params as { runId: string };
    const query = request.query as { severity?: string };

    if (!ObjectId.isValid(runId)) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const { runs, findings } = getCollections();
    const run = await runs.findOne({ _id: new ObjectId(runId) });
    if (!run) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    await verifyProjectOwnership(run.projectId.toHexString(), user);

    const filter: Record<string, any> = { runId: run._id };
    if (query.severity) {
      filter.severity = query.severity;
    }

    const list = await findings.find(filter).sort({ createdAt: -1 }).toArray();

    return sendSuccess(
      reply,
      list.map(f => ({
        id: f._id.toHexString(),
        projectId: f.projectId.toHexString(),
        runId: f.runId.toHexString(),
        fingerprint: f.fingerprint,
        previousVersion: f.previousVersion,
        currentVersion: f.currentVersion,
        endpoint: f.endpoint,
        method: f.method,
        changeType: f.changeType,
        severity: f.severity,
        ruleId: f.ruleId,
        description: f.description,
        impact: f.impact,
        recommendation: f.recommendation,
        aiExplanation: f.aiExplanation,
        createdAt: f.createdAt.toISOString(),
      })),
    );
  });

  // GET /runs/:runId/report
  app.get(ROUTES.RUNS.REPORT, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { runId } = request.params as { runId: string };

    if (!ObjectId.isValid(runId)) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const { runs, findings, projects } = getCollections();
    const run = await runs.findOne({ _id: new ObjectId(runId) });
    if (!run) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const project = await verifyProjectOwnership(run.projectId.toHexString(), user);
    const findingList = await findings.find({ runId: run._id }).toArray();

    const disclaimer =
      'This report assesses API compatibility based on the OpenAPI specifications provided. It does not guarantee the release is safe.';

    return sendSuccess(reply, {
      project: {
        id: project.id.toHexString(),
        fullName: project.fullName,
        specPath: project.specPath,
      },
      run: {
        id: run._id.toHexString(),
        currentVersion: run.currentVersion,
        previousVersion: run.previousVersion,
        status: run.status,
        summary: run.summary,
        createdAt: run.createdAt.toISOString(),
      },
      findings: findingList.map(f => ({
        id: f._id.toHexString(),
        endpoint: f.endpoint,
        method: f.method,
        changeType: f.changeType,
        severity: f.severity,
        description: f.description,
        impact: f.impact,
        recommendation: f.recommendation,
        fingerprint: f.fingerprint,
      })),
      disclaimer,
    });
  });

  // GET /projects/:projectId/runs/:runId/ai-dossier
  app.get('/projects/:projectId/runs/:runId/ai-dossier', { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { projectId, runId } = request.params as { projectId: string; runId: string };

    const project = await verifyProjectOwnership(projectId, user);
    const { runs, findings } = getCollections();

    const run = await runs.findOne({ _id: new ObjectId(runId), projectId: new ObjectId(projectId) });
    if (!run) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const runFindings = await findings.find({ runId: new ObjectId(runId) }).toArray();
    const { generateMultiLayerDossier } = await import('../ai/gemini-service.js');
    const { createHotspotsPipeline } = await import('./pipelines.js');

    const hotspots = await findings.aggregate(createHotspotsPipeline(project.id)).toArray();

    const dossier = await generateMultiLayerDossier(
      project.fullName,
      run.currentVersion || 'HEAD',
      runFindings.map((f) => ({
        endpoint: f.endpoint,
        method: f.method,
        changeType: f.changeType,
        severity: f.severity,
        description: f.description,
        impact: f.impact,
        recommendation: f.recommendation,
      })),
      hotspots.length,
    );

    return sendSuccess(reply, dossier);
  });

  // GET /projects/:projectId/compare?base=<runId>&head=<runId>
  app.get(ROUTES.RUNS.COMPARE, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { projectId } = request.params as { projectId: string };
    const query = compareRunsQuerySchema.parse(request.query);

    const project = await verifyProjectOwnership(projectId, user);
    const { findings } = getCollections();

    const baseRunId = new ObjectId(query.base);
    const headRunId = new ObjectId(query.head);

    const pipeline = createComparePipeline(project.id, baseRunId, headRunId);
    const diffFindings = await findings.aggregate(pipeline).toArray();

    return sendSuccess(
      reply,
      diffFindings.map((f: any) => ({
        id: f._id?.toHexString() || f.fingerprint,
        projectId: projectId,
        runId: f.runId ? f.runId.toHexString() : headRunId.toHexString(),
        fingerprint: f.fingerprint || f._id,
        endpoint: f.endpoint,
        method: f.method,
        changeType: f.changeType,
        severity: f.severity,
        ruleId: f.ruleId,
        description: f.description,
        impact: f.impact,
        recommendation: f.recommendation,
        diffStatus: f.diffStatus,
        createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
      })),
    );
  });
};
