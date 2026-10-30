import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import { AppError, ROUTES } from '@shaktiq/shared';
import { getCollections } from '../../db/collections.js';
import { sendSuccess } from '../../lib/response.js';
import { authenticate, verifyProjectOwnership } from '../../plugins/auth.js';
import { createHotspotsPipeline } from '../runs/pipelines.js';

export const memoryRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /projects/:projectId/memory/hotspots
  app.get(ROUTES.MEMORY.HOTSPOTS, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { projectId } = request.params as { projectId: string };

    const project = await verifyProjectOwnership(projectId, user);
    const { findings } = getCollections();

    const pipeline = createHotspotsPipeline(project.id);
    const hotspots = await findings.aggregate(pipeline).toArray();

    return sendSuccess(
      reply,
      hotspots.map((h: any) => ({
        endpoint: h.endpoint,
        method: h.method,
        occurrences: h.occurrences,
        distinctRuns: h.distinctRuns,
        lastSeen: new Date(h.lastSeen).toISOString(),
        changeTypes: h.changeTypes,
      })),
    );
  });

  // GET /projects/:projectId/memory/endpoint?method=&path=&excludeRunId=
  app.get(ROUTES.MEMORY.ENDPOINT, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { projectId } = request.params as { projectId: string };
    const query = request.query as { method?: string; path?: string; excludeRunId?: string };

    if (!query.method || !query.path) {
      throw new AppError('VALIDATION_ERROR', 'Method and path query parameters are required');
    }

    const project = await verifyProjectOwnership(projectId, user);
    const { findings } = getCollections();

    const filter: Record<string, any> = {
      projectId: project.id,
      method: query.method.toUpperCase(),
      endpoint: query.path,
    };

    if (query.excludeRunId && ObjectId.isValid(query.excludeRunId)) {
      filter.runId = { $ne: new ObjectId(query.excludeRunId) };
    }

    // Served by the {projectId:1, method:1, endpoint:1, createdAt:-1} index
    const list = await findings.find(filter).sort({ createdAt: -1 }).limit(20).toArray();

    return sendSuccess(
      reply,
      list.map(f => ({
        id: f._id.toHexString(),
        runId: f.runId.toHexString(),
        previousVersion: f.previousVersion,
        currentVersion: f.currentVersion,
        changeType: f.changeType,
        severity: f.severity,
        description: f.description,
        createdAt: f.createdAt.toISOString(),
      })),
    );
  });
};
