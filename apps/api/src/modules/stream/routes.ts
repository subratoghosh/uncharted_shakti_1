import crypto from 'node:crypto';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ROUTES, SseMessage } from '@shaktiq/shared';
import { authenticate } from '../../plugins/auth.js';
import { hub } from './hub.js';

export const streamRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /stream
  app.get(ROUTES.STREAM.SUBSCRIBE, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const query = request.query as { projectId?: string };

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');
    reply.raw.flushHeaders();

    const subId = crypto.randomUUID();

    const listener = (msg: SseMessage) => {
      reply.raw.write(`event: ${msg.type}\ndata: ${JSON.stringify(msg.data)}\n\n`);
    };

    const unsubscribe = hub.subscribe({
      id: subId,
      userId: user.id,
      role: user.role,
      projectId: query.projectId,
      listener,
    });

    // Send initial connection event
    reply.raw.write(
      `event: connected\ndata: ${JSON.stringify({ userId: user.id, timestamp: new Date().toISOString() })}\n\n`,
    );

    // Heartbeat every 25 seconds per architecture.md section 7
    const heartbeatTimer = setInterval(() => {
      reply.raw.write(`: heartbeat\n\n`);
    }, 25000);

    request.raw.on('close', () => {
      clearInterval(heartbeatTimer);
      unsubscribe();
    });
  });
};
