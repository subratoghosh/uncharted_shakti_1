import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { AppError } from '@shaktiq/shared';
import { env } from '../config/env.js';
import { getCollections } from '../db/collections.js';
import { sha256, timingSafeStringCompare } from '../lib/hash.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export function signJwtToken(user: { id: string; email: string; role: 'user' | 'admin' }): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: '8h',
    },
  );
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  // 1. Check cookie
  const cookieToken = request.cookies['sq_session'];
  let rawToken: string | undefined = cookieToken;

  // 2. Check Authorization header
  const authHeader = request.headers.authorization;
  if (!rawToken && authHeader?.startsWith('Bearer ')) {
    rawToken = authHeader.substring(7).trim();
  }

  if (!rawToken) {
    throw new AppError('UNAUTHENTICATED', 'Authentication required');
  }

  // Check if it is a Personal Access Token (starts with sq_)
  if (rawToken.startsWith('sq_')) {
    const tokenHash = sha256(rawToken);
    const { apiTokens, users } = getCollections();
    const tokenDoc = await apiTokens.findOne({ tokenHash, revokedAt: null });

    if (!tokenDoc) {
      throw new AppError('UNAUTHENTICATED', 'Invalid or revoked access token');
    }

    const userDoc = await users.findOne({ _id: tokenDoc.userId, disabled: false });
    if (!userDoc) {
      throw new AppError('UNAUTHENTICATED', 'User account not found or disabled');
    }

    // Update lastUsedAt asynchronously
    apiTokens.updateOne({ _id: tokenDoc._id }, { $set: { lastUsedAt: new Date() } }).catch(() => {});

    request.user = {
      id: userDoc._id.toHexString(),
      email: userDoc.email,
      role: userDoc.role,
    };
    return;
  }

  // Otherwise verify JWT
  try {
    const payload = jwt.verify(rawToken, env.JWT_SECRET) as {
      sub: string;
      email: string;
      role: 'user' | 'admin';
    };

    const { users } = getCollections();
    const userDoc = await users.findOne({ _id: new ObjectId(payload.sub), disabled: false });
    if (!userDoc) {
      throw new AppError('UNAUTHENTICATED', 'User account not found or disabled');
    }

    request.user = {
      id: userDoc._id.toHexString(),
      email: userDoc.email,
      role: userDoc.role,
    };
  } catch (err) {
    throw new AppError('UNAUTHENTICATED', 'Invalid or expired session');
  }
}

export function requireRole(role: 'admin') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (request.user?.role !== role) {
      throw new AppError('FORBIDDEN', 'Administrative privilege required');
    }
  };
}

export async function requireInternalKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const headerKey = request.headers['x-shaktiq-internal-key'];
  if (typeof headerKey !== 'string') {
    throw new AppError('UNAUTHENTICATED', 'Missing internal API key');
  }

  if (!timingSafeStringCompare(headerKey, env.INTERNAL_API_KEY)) {
    throw new AppError('UNAUTHENTICATED', 'Invalid internal API key');
  }
}

export async function verifyProjectOwnership(
  projectId: string,
  user: AuthUser,
): Promise<{ id: ObjectId; fullName: string; defaultBranch: string; specPath: string }> {
  if (!ObjectId.isValid(projectId)) {
    throw new AppError('NOT_FOUND', 'Project not found');
  }

  const { projects } = getCollections();
  const project = await projects.findOne({ _id: new ObjectId(projectId) });

  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found');
  }

  // 404 for other users' resources to avoid enumeration per security.md
  if (user.role !== 'admin' && project.ownerUserId.toHexString() !== user.id) {
    throw new AppError('NOT_FOUND', 'Project not found');
  }

  return {
    id: project._id,
    fullName: project.fullName,
    defaultBranch: project.defaultBranch,
    specPath: project.specPath,
  };
}
