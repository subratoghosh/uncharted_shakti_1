import Fastify from 'fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { type RunSummary, type FindingDraft } from '@shaktiq/shared';

export const app = Fastify({ logger: false });

// In-memory call log for testing workflow executions
export type StubCall = {
  method: string;
  url: string;
  headers: Record<string, unknown>;
  body: unknown;
  timestamp: string;
};

export const recordedCalls: StubCall[] = [];

// Internal key from env
const EXPECTED_INTERNAL_KEY =
  process.env.INTERNAL_API_KEY || 'development-internal-api-key-minimum-32-characters';

function checkAuth(req: FastifyRequest, reply: FastifyReply): boolean {
  const key = req.headers['x-shaktiq-internal-key'];
  if (key !== EXPECTED_INTERNAL_KEY) {
    reply.status(401).send({
      ok: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Invalid or missing internal API key',
      },
    });
    return false;
  }
  return true;
}

app.addHook('preHandler', async (req, reply) => {
  if (req.url.startsWith('/internal/')) {
    if (!checkAuth(req, reply)) {
      return;
    }
  }

  recordedCalls.push({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async () => ({ ok: true, stub: true }));

app.get('/stub/calls', async () => ({
  ok: true,
  data: recordedCalls,
}));

app.post('/stub/reset', async () => {
  recordedCalls.length = 0;
  return { ok: true, reset: true };
});

// Configurable stub state for tests (e.g. simulate failure or specSource)
export const stubState: {
  specSource: 'github' | 'snapshots';
  simulateAnalyze500: boolean;
  aiEnabled: boolean;
  pullRequestNumber: number | null;
} = {
  specSource: 'snapshots',
  simulateAnalyze500: false,
  aiEnabled: false,
  pullRequestNumber: 42,
};

app.post('/stub/config', async (req: FastifyRequest<{ Body: Partial<typeof stubState> }>) => {
  Object.assign(stubState, req.body);
  return { ok: true, state: stubState };
});

// 1. POST /internal/runs/:runId/start
app.post(
  '/internal/runs/:runId/start',
  async (req: FastifyRequest<{ Params: { runId: string } }>) => {
    return {
      ok: true,
      data: {
        runId: req.params.runId,
        projectId: 'stub-project-001',
        specSource: stubState.specSource,
        repo: {
          fullName: 'acme/orders',
          specPath: 'openapi.yaml',
        },
        baseRef: 'main',
        headRef: 'feat/test',
        source: 'github',
        pullRequestNumber: stubState.pullRequestNumber,
        aiEnabled: stubState.aiEnabled,
      },
    };
  },
);

// 2. POST /internal/runs/:runId/analyze
app.post(
  '/internal/runs/:runId/analyze',
  async (
    req: FastifyRequest<{
      Params: { runId: string };
      Body: { base?: { content: string }; head?: { content: string } };
    }>,
    reply: FastifyReply,
  ) => {
    if (stubState.simulateAnalyze500) {
      reply.status(500).send({ ok: false, error: 'Simulated internal server error' });
      return;
    }

    const summary: RunSummary = {
      total: 2,
      breaking: 1,
      warning: 1,
      info: 0,
      releaseStatus: 'blocked',
      newCount: 1,
      resolvedCount: 0,
      unresolvedCount: 1,
    };

    const topFindings: FindingDraft[] = [
      {
        fingerprint: 'a'.repeat(64),
        endpoint: '/users/{id}',
        method: 'DELETE',
        changeType: 'ENDPOINT_REMOVED',
        severity: 'breaking',
        ruleId: 'api-path-removed-without-deprecation',
        description: 'Endpoint DELETE /users/{id} removed',
        impact: 'Clients will receive 404',
        recommendation: 'Restore endpoint',
      },
    ];

    return {
      ok: true,
      data: {
        summary,
        findingCount: 2,
        topFindings,
      },
    };
  },
);

// 3. POST /internal/runs/:runId/explanations
app.post(
  '/internal/runs/:runId/explanations',
  async (
    req: FastifyRequest<{
      Params: { runId: string };
      Body: {
        runSummaryText?: string;
        findings: Array<{ fingerprint: string; explanation: string }>;
      };
    }>,
  ) => {
    return {
      ok: true,
      data: {
        updated: true,
        findingsCount: req.body?.findings?.length ?? 0,
      },
    };
  },
);

// 4. POST /internal/runs/:runId/notifications
app.post(
  '/internal/runs/:runId/notifications',
  async (
    _req: FastifyRequest<{
      Params: { runId: string };
      Body: {
        channel: string;
        status: string;
        target: string;
        responseCode?: number;
        error?: string;
      };
    }>,
  ) => {
    return {
      ok: true,
      data: {
        notificationId: 'notif-12345',
        recorded: true,
      },
    };
  },
);

// 5. POST /internal/runs/:runId/fail
app.post(
  '/internal/runs/:runId/fail',
  async (
    req: FastifyRequest<{
      Params: { runId: string };
      Body: { errorCode: string; errorMessage: string };
    }>,
  ) => {
    return {
      ok: true,
      data: {
        runId: req.params.runId,
        status: 'failed',
        errorCode: req.body?.errorCode,
        errorMessage: req.body?.errorMessage,
      },
    };
  },
);

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT) || 4000;
  app.listen({ port, host: '0.0.0.0' }, err => {
    if (err) {
      process.exit(1);
    }
  });
}
