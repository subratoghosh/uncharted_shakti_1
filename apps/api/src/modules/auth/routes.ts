import argon2 from 'argon2';
import crypto from 'node:crypto';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import {
  AppError,
  createApiTokenRequestSchema,
  loginRequestSchema,
  registerRequestSchema,
  ROUTES,
} from '@shaktiq/shared';
import { env } from '../../config/env.js';
import { getCollections } from '../../db/collections.js';
import { sha256 } from '../../lib/hash.js';
import { sendSuccess } from '../../lib/response.js';
import { authenticate, signJwtToken } from '../../plugins/auth.js';
import { authRateLimiter, rateLimitGuard } from '../../lib/redis.js';

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // POST /auth/register
  app.post(ROUTES.AUTH.REGISTER, { preHandler: [rateLimitGuard(authRateLimiter)] }, async (request, reply) => {
    const body = registerRequestSchema.parse(request.body);
    const { users } = getCollections();

    const existing = await users.findOne({ email: body.email });
    if (existing) {
      throw new AppError('CONFLICT', 'An account with this email already exists');
    }

    const passwordHash = await argon2.hash(body.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const now = new Date();
    const newUser = {
      _id: new ObjectId(),
      email: body.email,
      passwordHash,
      name: body.name,
      role: 'user' as const,
      disabled: false,
      createdAt: now,
      updatedAt: now,
    };

    await users.insertOne(newUser);

    const token = signJwtToken({
      id: newUser._id.toHexString(),
      email: newUser.email,
      role: newUser.role,
    });

    reply.setCookie('sq_session', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return sendSuccess(
      reply,
      {
        id: newUser._id.toHexString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        disabled: newUser.disabled,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      },
      201,
    );
  });

  // POST /auth/login
  app.post(ROUTES.AUTH.LOGIN, { preHandler: [rateLimitGuard(authRateLimiter)] }, async (request, reply) => {
    const body = loginRequestSchema.parse(request.body);
    const { users } = getCollections();

    const user = await users.findOne({ email: body.email });
    if (!user || user.disabled) {
      // Generic message to prevent enumeration per security.md
      throw new AppError('UNAUTHENTICATED', 'Invalid email or password');
    }

    const validPassword = await argon2.verify(user.passwordHash, body.password);
    if (!validPassword) {
      throw new AppError('UNAUTHENTICATED', 'Invalid email or password');
    }

    const token = signJwtToken({
      id: user._id.toHexString(),
      email: user.email,
      role: user.role,
    });

    reply.setCookie('sq_session', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });

    return sendSuccess(reply, {
      id: user._id.toHexString(),
      email: user.email,
      name: user.name,
      role: user.role,
      disabled: user.disabled,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  });

  // POST /auth/logout
  app.post(ROUTES.AUTH.LOGOUT, async (request, reply) => {
    reply.clearCookie('sq_session', { path: '/' });
    return sendSuccess(reply, { loggedOut: true });
  });

  // GET /auth/me
  app.get(ROUTES.AUTH.ME, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { users } = getCollections();

    const userDoc = await users.findOne({ _id: new ObjectId(user.id) });
    if (!userDoc) {
      throw new AppError('NOT_FOUND', 'User not found');
    }

    return sendSuccess(reply, {
      id: userDoc._id.toHexString(),
      email: userDoc.email,
      name: userDoc.name,
      role: userDoc.role,
      disabled: userDoc.disabled,
      createdAt: userDoc.createdAt.toISOString(),
      updatedAt: userDoc.updatedAt.toISOString(),
    });
  });

  // GET /tokens
  app.get(ROUTES.TOKENS.LIST, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { apiTokens } = getCollections();

    const tokens = await apiTokens
      .find({ userId: new ObjectId(user.id), revokedAt: null })
      .sort({ createdAt: -1 })
      .toArray();

    return sendSuccess(
      reply,
      tokens.map(t => ({
        id: t._id.toHexString(),
        userId: t.userId.toHexString(),
        name: t.name,
        prefix: t.prefix,
        lastUsedAt: t.lastUsedAt?.toISOString() || null,
        revokedAt: t.revokedAt?.toISOString() || null,
        createdAt: t.createdAt.toISOString(),
      })),
    );
  });

  // POST /tokens
  app.post(ROUTES.TOKENS.CREATE, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const body = createApiTokenRequestSchema.parse(request.body);
    const { apiTokens } = getCollections();

    // Generate random 32 bytes base64url token with sq_ prefix
    const randomBytes = crypto.randomBytes(32).toString('base64url');
    const rawToken = `sq_${randomBytes}`;
    const tokenHash = sha256(rawToken);
    const prefix = rawToken.substring(0, 10);

    const now = new Date();
    const doc = {
      _id: new ObjectId(),
      userId: new ObjectId(user.id),
      name: body.name,
      tokenHash,
      prefix,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: now,
    };

    await apiTokens.insertOne(doc);

    return sendSuccess(
      reply,
      {
        apiToken: {
          id: doc._id.toHexString(),
          userId: doc.userId.toHexString(),
          name: doc.name,
          prefix: doc.prefix,
          lastUsedAt: null,
          revokedAt: null,
          createdAt: doc.createdAt.toISOString(),
        },
        token: rawToken, // Displayed only once
      },
      201,
    );
  });

  // DELETE /tokens/:tokenId
  app.delete(ROUTES.TOKENS.REVOKE, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const { tokenId } = request.params as { tokenId: string };

    if (!ObjectId.isValid(tokenId)) {
      throw new AppError('NOT_FOUND', 'Token not found');
    }

    const { apiTokens } = getCollections();
    const filter =
      user.role === 'admin'
        ? { _id: new ObjectId(tokenId) }
        : { _id: new ObjectId(tokenId), userId: new ObjectId(user.id) };

    const result = await apiTokens.updateOne(filter, { $set: { revokedAt: new Date() } });

    if (result.matchedCount === 0) {
      throw new AppError('NOT_FOUND', 'Token not found');
    }

    return sendSuccess(reply, { revoked: true });
  });
};
