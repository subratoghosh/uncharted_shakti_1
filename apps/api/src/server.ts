import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyRawBody from 'fastify-raw-body';
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { API_PREFIX, AppError, ROUTES } from '@shaktiq/shared';
import { env } from './config/env.js';
import { closeDb, connectDb, getDb } from './db/client.js';
import { logger } from './lib/logger.js';
import { sendError, sendSuccess } from './lib/response.js';
import { adminRoutes } from './modules/admin/routes.js';
import { authRoutes } from './modules/auth/routes.js';
import { cliRoutes } from './modules/cli/routes.js';
import { eventRoutes } from './modules/events/routes.js';
import { internalRoutes } from './modules/internal/routes.js';
import { memoryRoutes } from './modules/memory/routes.js';
import { projectRoutes } from './modules/projects/routes.js';
import { runRoutes } from './modules/runs/routes.js';
import { hub } from './modules/stream/hub.js';
import { streamRoutes } from './modules/stream/routes.js';

export const serverPlaceholder = 'apps/api bootstrap';

export async function buildServer(): Promise<FastifyInstance> {
  const app = fastify({
    logger: false, // Using our centralized Pino logger
    bodyLimit: 6 * 1024 * 1024, // 6 MB max per security.md section 7
  });

  // 1. Raw body preservation for webhook HMAC
  await app.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: false, // returns Buffer
    runFirst: true,
  });

  // 2. Cookie support
  await app.register(fastifyCookie);

  // 3. CORS
  await app.register(fastifyCors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // 4. Rate limiting per security.md section 8
  await app.register(fastifyRateLimit, {
    max: 120,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
      },
    }),
  });

  // Request logger hook
  app.addHook('onRequest', async req => {
    logger.info({ reqId: req.id, method: req.method, url: req.url }, 'Incoming request');
  });

  app.addHook('onResponse', async (req, reply) => {
    logger.info(
      {
        reqId: req.id,
        method: req.method,
        url: req.url,
        statusCode: reply.statusCode,
        durationMs: reply.elapsedTime,
      },
      'Request completed',
    );
  });

  // Central Error Handler per code_style.md section 5-6
  const errorHandler = (error: any, request: FastifyRequest, reply: FastifyReply) => {
    // 1. Handled AppError
    if (
      error instanceof AppError ||
      error.name === 'AppError' ||
      (error.code && error.statusCode)
    ) {
      return sendError(reply, error.code, error.message, error.statusCode || 500, error.details);
    }

    // 2. Zod Validation Error
    if (error instanceof ZodError) {
      const details = error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return sendError(reply, 'VALIDATION_ERROR', 'Validation error', 400, details);
    }

    // 3. Fastify Validation Error
    if (error.validation) {
      return sendError(reply, 'VALIDATION_ERROR', error.message, 400);
    }

    // 4. Rate limit
    if (error.statusCode === 429) {
      return sendError(reply, 'RATE_LIMITED', error.message || 'Rate limit exceeded', 429);
    }

    // 5. Unhandled internal error
    logger.error({ err: error, reqId: request.id }, 'Unhandled internal server error');
    return sendError(
      reply,
      'INTERNAL',
      env.NODE_ENV === 'production' ? 'An internal server error occurred' : error.message,
      500,
    );
  };

  const notFoundHandler = (_req: FastifyRequest, reply: FastifyReply) => {
    return sendError(reply, 'NOT_FOUND', 'Resource not found', 404);
  };

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  // Health checks
  const getHealthStatus = () => {
    const hasGemini = Boolean(
      env.GEMINI_API_KEY &&
      env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
      env.GEMINI_API_KEY.length > 10
    );
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      ai: {
        engine: hasGemini ? 'gemini-3.8-flash' : 'deterministic-intelligence',
        enabled: true,
      },
    };
  };

  app.get(ROUTES.HEALTH, async (_req, reply) => {
    return sendSuccess(reply, getHealthStatus());
  });

  app.get(`${API_PREFIX}${ROUTES.HEALTH}`, async (_req, reply) => {
    return sendSuccess(reply, getHealthStatus());
  });

  // Register API modules under /api/v1
  await app.register(
    async api => {
      api.setErrorHandler(errorHandler);
      api.setNotFoundHandler(notFoundHandler);

      await api.register(authRoutes);
      await api.register(projectRoutes);
      await api.register(eventRoutes);
      await api.register(runRoutes);
      await api.register(memoryRoutes);
      await api.register(internalRoutes);
      await api.register(adminRoutes);
      await api.register(cliRoutes);
      await api.register(streamRoutes);
    },
    { prefix: API_PREFIX },
  );

  return app;
}

export async function startServer(): Promise<void> {
  try {
    const db = await connectDb();
    hub.start(db).catch(e => logger.warn({ err: e }, 'ChangeStreamHub notice'));

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`⚡ ShaktIQ API server listening on http://localhost:${env.PORT}`);

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      hub.stop();
      await app.close();
      await closeDb();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  startServer();
}
