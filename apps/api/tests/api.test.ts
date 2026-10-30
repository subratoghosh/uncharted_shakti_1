import crypto from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { env } from '../src/config/env.js';
import { closeDb, connectDb } from '../src/db/client.js';
import { migrate } from '../src/db/migrate.js';
import { buildServer } from '../src/server.js';

describe('Fastify API Endpoint Integration Tests (testing.md §5)', () => {
  let mongod: MongoMemoryServer;
  let app: FastifyInstance;
  let db: Db;
  let authToken: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    db = await connectDb(uri, 'shaktiq_test');
    await migrate(db);
    app = await buildServer();
    await app.ready();
  }, 30000);

  afterAll(async () => {
    await app.close();
    await closeDb();
    if (mongod) await mongod.stop();
  });

  it('GET /health returns healthy status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe('healthy');
  });

  it('POST /api/v1/auth/register creates user and returns JWT cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'developer@test.com',
        password: 'Password123!',
        name: 'Dev Tester',
      },
    });

    expect(res.statusCode).toBe(201);
    const json = JSON.parse(res.body);
    expect(json.ok).toBe(true);
    expect(json.data.email).toBe('developer@test.com');
    userId = json.data.id;

    const cookie = res.headers['set-cookie'];
    expect(cookie).toBeDefined();

    // Login to get token for headers
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'developer@test.com',
        password: 'Password123!',
      },
    });

    expect(loginRes.statusCode).toBe(200);
    const cookieHeader = loginRes.headers['set-cookie'] as string;
    const match = cookieHeader.match(/sq_session=([^;]+)/);
    expect(match).toBeTruthy();
    authToken = match![1]!;
  });

  it('POST /api/v1/projects registers a repository with unique constraint', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        name: 'Orders Service',
        repositoryUrl: 'https://github.com/acme/orders',
        defaultBranch: 'main',
        specPath: 'openapi.yaml',
      },
    });

    expect(res.statusCode).toBe(201);
    const json = JSON.parse(res.body);
    expect(json.ok).toBe(true);
    expect(json.data.fullName).toBe('acme/orders');
    projectId = json.data.id;

    // Duplicate project registration fails with 409 CONFLICT
    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        name: 'Orders Duplicate',
        repositoryUrl: 'https://github.com/acme/orders',
      },
    });
    expect(dupRes.statusCode).toBe(409);
  });

  it('GET /api/v1/projects/:projectId enforces ownership (returns 404 for other user)', async () => {
    // Register second user
    const user2Res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'attacker@test.com',
        password: 'Password123!',
        name: 'Attacker',
      },
    });
    const cookieHeader = user2Res.headers['set-cookie'] as string;
    const token2 = cookieHeader.match(/sq_session=([^;]+)/)![1]!;

    // Attempt to access user 1's project -> returns 404 NOT_FOUND per security.md
    const accessRes = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}`,
      headers: {
        authorization: `Bearer ${token2}`,
      },
    });

    expect(accessRes.statusCode).toBe(404);
    const json = JSON.parse(accessRes.body);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('POST /api/v1/webhooks/github rejects invalid HMAC signatures with 401', async () => {
    const deliveryId = crypto.randomUUID();
    const payload = JSON.stringify({
      repository: { full_name: 'acme/orders' },
      ref: 'refs/heads/main',
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/webhooks/github',
      headers: {
        'x-github-delivery': deliveryId,
        'x-github-event': 'push',
        'x-hub-signature-256': 'sha256=invalidbadsignature00000000000000000000000000000000000000000000',
        'content-type': 'application/json',
      },
      payload,
    });

    expect(res.statusCode).toBe(401);
    const json = JSON.parse(res.body);
    expect(json.error.code).toBe('INVALID_SIGNATURE');

    // Verify rejected event recorded in events collection
    const rejectedEvent = await db.collection('events').findOne({ eventId: `rejected:${deliveryId}` });
    expect(rejectedEvent).toBeDefined();
    expect(rejectedEvent?.processingStatus).toBe('rejected');
  });

  it('POST /api/v1/webhooks/github processes valid push and deduplicates identical delivery', async () => {
    const deliveryId = crypto.randomUUID();
    const bodyObj = {
      repository: { full_name: 'acme/orders' },
      ref: 'refs/heads/main',
      before: 'v1.0.0',
      after: 'v1.1.0',
    };
    const rawPayload = JSON.stringify(bodyObj);

    // Compute valid HMAC
    const hmac = crypto.createHmac('sha256', env.GITHUB_WEBHOOK_SECRET);
    hmac.update(rawPayload);
    const signature = `sha256=${hmac.digest('hex')}`;

    // 1st delivery -> 202 duplicate: false
    const firstRes = await app.inject({
      method: 'POST',
      url: '/api/v1/webhooks/github',
      headers: {
        'x-github-delivery': deliveryId,
        'x-github-event': 'push',
        'x-hub-signature-256': signature,
        'content-type': 'application/json',
      },
      payload: rawPayload,
    });

    expect(firstRes.statusCode).toBe(202);
    const firstJson = JSON.parse(firstRes.body);
    expect(firstJson.ok).toBe(true);
    expect(firstJson.data.duplicate).toBe(false);
    const runId = firstJson.data.runId;

    // 2nd delivery with same delivery ID -> 200 duplicate: true
    const secondRes = await app.inject({
      method: 'POST',
      url: '/api/v1/webhooks/github',
      headers: {
        'x-github-delivery': deliveryId,
        'x-github-event': 'push',
        'x-hub-signature-256': signature,
        'content-type': 'application/json',
      },
      payload: rawPayload,
    });

    expect(secondRes.statusCode).toBe(200);
    const secondJson = JSON.parse(secondRes.body);
    expect(secondJson.ok).toBe(true);
    expect(secondJson.data.duplicate).toBe(true);
    expect(secondJson.data.runId).toBe(runId);
  });

  it('Internal routes are protected by x-shaktiq-internal-key', async () => {
    // Missing key -> 401
    const resWithoutKey = await app.inject({
      method: 'POST',
      url: `/api/v1/internal/runs/${new ObjectId().toHexString()}/start`,
    });
    expect(resWithoutKey.statusCode).toBe(401);

    // Wrong key -> 401
    const resWrongKey = await app.inject({
      method: 'POST',
      url: `/api/v1/internal/runs/${new ObjectId().toHexString()}/start`,
      headers: {
        'x-shaktiq-internal-key': 'wrong_invalid_key_value_here_32_chars',
      },
    });
    expect(resWrongKey.statusCode).toBe(401);
  });

  it('Internal analyze run computes deterministic findings and releaseStatus', async () => {
    // Create a run in DB
    const runId = new ObjectId();
    await db.collection('runs').insertOne({
      _id: runId,
      projectId: new ObjectId(projectId),
      eventId: 'manual:test-analyze',
      source: 'manual',
      currentVersion: 'v2',
      branch: 'main',
      status: 'running',
      createdAt: new Date(),
      aiStatus: 'disabled',
    });

    const baseSpec = `
openapi: 3.0.0
info:
  title: API
  version: 1.0.0
paths:
  /orders:
    get:
      summary: List orders
  /orders/{id}:
    delete:
      summary: Delete order
`;

    const headSpec = `
openapi: 3.0.0
info:
  title: API
  version: 2.0.0
paths:
  /orders:
    get:
      summary: List orders
`;

    const analyzeRes = await app.inject({
      method: 'POST',
      url: `/api/v1/internal/runs/${runId.toHexString()}/analyze`,
      headers: {
        'x-shaktiq-internal-key': env.INTERNAL_API_KEY,
      },
      payload: {
        base: { content: baseSpec },
        head: { content: headSpec },
      },
    });

    expect(analyzeRes.statusCode).toBe(200);
    const json = JSON.parse(analyzeRes.body);
    expect(json.ok).toBe(true);
    expect(json.data.summary.breaking).toBeGreaterThanOrEqual(1);
    expect(json.data.summary.releaseStatus).toBe('blocked');

    // Verify findings stored
    const findings = await db.collection('findings').find({ runId }).toArray();
    expect(findings.length).toBeGreaterThanOrEqual(1);
    const removedEndpoint = findings.find((f) => f.endpoint === '/orders/{id}');
    expect(removedEndpoint?.severity).toBe('breaking');
  });

  it('PAT creation and VS Code CLI /cli/analyze execution', async () => {
    // Create PAT token
    const tokenRes = await app.inject({
      method: 'POST',
      url: '/api/v1/tokens',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        name: 'VS Code Extension',
      },
    });

    expect(tokenRes.statusCode).toBe(201);
    const pat = JSON.parse(tokenRes.body).data.token;
    expect(pat.startsWith('sq_')).toBe(true);

    // Call /cli/analyze using the PAT token
    const cliRes = await app.inject({
      method: 'POST',
      url: '/api/v1/cli/analyze',
      headers: {
        authorization: `Bearer ${pat}`,
      },
      payload: {
        projectId,
        baseSpec: 'openapi: 3.0.0\npaths:\n  /test:\n    get:\n      summary: a',
        headSpec: 'openapi: 3.0.0\npaths: {}',
      },
    });

    expect(cliRes.statusCode).toBe(202);
    const cliJson = JSON.parse(cliRes.body);
    expect(cliJson.ok).toBe(true);
    expect(cliJson.data.runId).toBeDefined();
    expect(cliJson.data.summary.releaseStatus).toBe('blocked');

    // Test GET /projects/:projectId/runs/:runId/ai-dossier
    const dossierRes = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/runs/${cliJson.data.runId}/ai-dossier`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(dossierRes.statusCode).toBe(200);
    const dossierJson = JSON.parse(dossierRes.body);
    expect(dossierJson.ok).toBe(true);
    expect(dossierJson.data.releaseScore).toBeDefined();
    expect(dossierJson.data.blastRadius).toBeDefined();
    expect(dossierJson.data.findingInsights).toBeDefined();
    expect(dossierJson.data.executiveActionPlan).toBeDefined();
  });
});
