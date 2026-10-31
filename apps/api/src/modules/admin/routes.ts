import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import { AppError, paginationQuerySchema, ROUTES, updateUserRequestSchema } from '@shaktiq/shared';
import { env } from '../../config/env.js';
import { getCollections } from '../../db/collections.js';
import { logger } from '../../lib/logger.js';
import { sendSuccess } from '../../lib/response.js';
import { requireRole } from '../../plugins/auth.js';
import { createAdminOverviewPipeline } from '../runs/pipelines.js';

export const adminRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // All admin routes require role: admin
  app.addHook('preHandler', requireRole('admin'));

  // GET /admin/overview
  app.get(ROUTES.ADMIN.OVERVIEW, async (request, reply) => {
    const { runs, events, projects, users } = getCollections();

    const [overviewData, totalProjects, totalUsers, duplicateEventCount, rejectedEventCount] =
      await Promise.all([
        runs.aggregate(createAdminOverviewPipeline()).toArray(),
        projects.countDocuments(),
        users.countDocuments(),
        events
          .aggregate([{ $group: { _id: null, totalDuplicates: { $sum: '$duplicateCount' } } }])
          .toArray(),
        events.countDocuments({ processingStatus: 'rejected' }),
      ]);

    const runStats = overviewData[0] || { runsByStatus: [], runsLast24h: [] };
    const runsByStatus: Record<string, number> = {};
    for (const item of runStats.runsByStatus || []) {
      runsByStatus[item._id] = item.count;
    }

    return sendSuccess(reply, {
      totalProjects,
      totalUsers,
      runsLast24h: runStats.runsLast24h[0]?.count || 0,
      runsByStatus,
      totalDuplicates: duplicateEventCount[0]?.totalDuplicates || 0,
      totalRejectedEvents: rejectedEventCount,
    });
  });

  // GET /admin/projects
  app.get(ROUTES.ADMIN.PROJECTS, async (request, reply) => {
    const query = paginationQuerySchema.parse(request.query);
    const { projects } = getCollections();

    const skip = (query.page - 1) * query.limit;
    const [list, total] = await Promise.all([
      projects.find().sort({ createdAt: -1 }).skip(skip).limit(query.limit).toArray(),
      projects.countDocuments(),
    ]);

    return sendSuccess(
      reply,
      list.map(p => ({
        id: p._id.toHexString(),
        ownerUserId: p.ownerUserId.toHexString(),
        name: p.name,
        repositoryUrl: p.repositoryUrl,
        fullName: p.fullName,
        defaultBranch: p.defaultBranch,
        specPath: p.specPath,
        createdAt: p.createdAt.toISOString(),
      })),
      200,
      { page: query.page, limit: query.limit, total },
    );
  });

  // GET /admin/runs
  app.get(ROUTES.ADMIN.RUNS, async (request, reply) => {
    const query = paginationQuerySchema.parse(request.query);
    const { runs } = getCollections();

    const skip = (query.page - 1) * query.limit;
    const [list, total] = await Promise.all([
      runs.find().sort({ createdAt: -1 }).skip(skip).limit(query.limit).toArray(),
      runs.countDocuments(),
    ]);

    return sendSuccess(
      reply,
      list.map(r => ({
        id: r._id.toHexString(),
        projectId: r.projectId.toHexString(),
        eventId: r.eventId,
        source: r.source,
        status: r.status,
        currentVersion: r.currentVersion,
        createdAt: r.createdAt.toISOString(),
        completedAt: r.completedAt?.toISOString() || null,
        summary: r.summary,
        errorCode: r.errorCode,
      })),
      200,
      { page: query.page, limit: query.limit, total },
    );
  });

  // GET /admin/events
  app.get(ROUTES.ADMIN.EVENTS, async (request, reply) => {
    const query = paginationQuerySchema.parse(request.query);
    const { events } = getCollections();

    const skip = (query.page - 1) * query.limit;
    const [list, total] = await Promise.all([
      events.find().sort({ receivedAt: -1 }).skip(skip).limit(query.limit).toArray(),
      events.countDocuments(),
    ]);

    return sendSuccess(
      reply,
      list.map(e => ({
        id: e._id.toHexString(),
        eventId: e.eventId,
        projectId: e.projectId ? e.projectId.toHexString() : null,
        eventType: e.eventType,
        source: e.source,
        processingStatus: e.processingStatus,
        duplicateCount: e.duplicateCount,
        lastDuplicateAt: e.lastDuplicateAt?.toISOString() || null,
        receivedAt: e.receivedAt.toISOString(),
        runId: e.runId ? e.runId.toHexString() : null,
        error: e.error,
      })),
      200,
      { page: query.page, limit: query.limit, total },
    );
  });

  // GET /admin/workflows/health
  app.get(ROUTES.ADMIN.WORKFLOWS_HEALTH, async (request, reply) => {
    let n8nReachable = false;
    let n8nStatus = 'unknown';

    try {
      const res = await fetch(
        env.N8N_WEBHOOK_URL.replace('/webhook/shaktiq-analyze-run', '/healthz'),
        {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        },
      );
      n8nReachable = res.ok;
      n8nStatus = res.status.toString();
    } catch (e: any) {
      n8nStatus = e.message || 'unreachable';
    }

    return sendSuccess(reply, {
      n8nWebhookUrl: env.N8N_WEBHOOK_URL,
      n8nReachable,
      n8nStatus,
      aiExplanationsEnabled: env.AI_EXPLANATIONS_ENABLED,
    });
  });

  // POST /admin/runs/:runId/retry
  app.post(ROUTES.ADMIN.RUN_RETRY, async (request, reply) => {
    const { runId } = request.params as { runId: string };
    if (!ObjectId.isValid(runId)) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    const { runs } = getCollections();
    const run = await runs.findOne({ _id: new ObjectId(runId) });
    if (!run) {
      throw new AppError('NOT_FOUND', 'Run not found');
    }

    // Reset status to queued
    await runs.updateOne(
      { _id: run._id },
      {
        $set: {
          status: 'queued',
          errorCode: null,
          errorMessage: null,
          startedAt: null,
          completedAt: null,
        },
      },
    );

    // Re-dispatch to n8n
    try {
      await fetch(env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shaktiq-webhook-token': env.N8N_WEBHOOK_TOKEN,
        },
        body: JSON.stringify({
          runId: run._id.toHexString(),
          projectId: run.projectId.toHexString(),
        }),
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to dispatch retry to n8n');
    }

    return sendSuccess(reply, { retried: true, runId: run._id.toHexString() });
  });

  // GET /admin/users
  app.get(ROUTES.ADMIN.USERS, async (request, reply) => {
    const query = paginationQuerySchema.parse(request.query);
    const { users } = getCollections();

    const skip = (query.page - 1) * query.limit;
    const [list, total] = await Promise.all([
      users.find().sort({ createdAt: -1 }).skip(skip).limit(query.limit).toArray(),
      users.countDocuments(),
    ]);

    return sendSuccess(
      reply,
      list.map(u => ({
        id: u._id.toHexString(),
        email: u.email,
        name: u.name,
        role: u.role,
        disabled: u.disabled,
        createdAt: u.createdAt.toISOString(),
      })),
      200,
      { page: query.page, limit: query.limit, total },
    );
  });

  // PATCH /admin/users/:userId
  app.patch(ROUTES.ADMIN.USER_UPDATE, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    if (!ObjectId.isValid(userId)) {
      throw new AppError('NOT_FOUND', 'User not found');
    }

    const body = updateUserRequestSchema.parse(request.body);
    const { users } = getCollections();

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (body.role !== undefined) updateFields.role = body.role;
    if (body.disabled !== undefined) updateFields.disabled = body.disabled;

    const result = await users.updateOne({ _id: new ObjectId(userId) }, { $set: updateFields });
    if (result.matchedCount === 0) {
      throw new AppError('NOT_FOUND', 'User not found');
    }

    const updated = await users.findOne({ _id: new ObjectId(userId) });

    return sendSuccess(reply, {
      id: updated!._id.toHexString(),
      email: updated!.email,
      name: updated!.name,
      role: updated!.role,
      disabled: updated!.disabled,
      updatedAt: updated!.updatedAt.toISOString(),
    });
  });
};
