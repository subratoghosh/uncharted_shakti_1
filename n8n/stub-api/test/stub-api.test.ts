import { describe, expect, it, beforeEach } from 'vitest';
import { app, recordedCalls, stubState } from '../src/server.js';

describe('n8n Stub API Unit Tests (testing.md §8)', () => {
  const internalKey =
    process.env.INTERNAL_API_KEY || 'development-internal-api-key-minimum-32-characters';

  beforeEach(async () => {
    await app.inject({
      method: 'POST',
      url: '/stub/reset',
    });
    stubState.simulateAnalyze500 = false;
    stubState.specSource = 'snapshots';
  });

  it('rejects requests missing x-shaktiq-internal-key header', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/internal/runs/run-123/start',
    });
    expect(res.statusCode).toBe(401);
    const json = res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe('UNAUTHENTICATED');
  });

  it('handles POST /internal/runs/:runId/start successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/internal/runs/run-123/start',
      headers: {
        'x-shaktiq-internal-key': internalKey,
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.ok).toBe(true);
    expect(json.data.runId).toBe('run-123');
    expect(json.data.repo.fullName).toBe('acme/orders');
    expect(recordedCalls.length).toBe(1);
    expect(recordedCalls[0]?.url).toBe('/internal/runs/run-123/start');
  });

  it('handles POST /internal/runs/:runId/analyze returning finding drafts and summary', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/internal/runs/run-123/analyze',
      headers: {
        'x-shaktiq-internal-key': internalKey,
      },
      payload: {},
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.ok).toBe(true);
    expect(json.data.findingCount).toBe(2);
    expect(json.data.summary.releaseStatus).toBe('blocked');
    expect(json.data.topFindings[0]?.changeType).toBe('ENDPOINT_REMOVED');
  });

  it('handles POST /internal/runs/:runId/explanations', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/internal/runs/run-123/explanations',
      headers: {
        'x-shaktiq-internal-key': internalKey,
      },
      payload: {
        runSummaryText: '1 breaking change detected',
        findings: [
          {
            fingerprint: 'a'.repeat(64),
            explanation: 'Endpoint removed',
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.ok).toBe(true);
    expect(json.data.updated).toBe(true);
  });

  it('handles POST /internal/runs/:runId/notifications', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/internal/runs/run-123/notifications',
      headers: {
        'x-shaktiq-internal-key': internalKey,
      },
      payload: {
        channel: 'github_pr_comment',
        status: 'sent',
        target: 'acme/orders#42',
        responseCode: 201,
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.ok).toBe(true);
    expect(json.data.notificationId).toBe('notif-12345');
  });

  it('handles POST /internal/runs/:runId/fail', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/internal/runs/run-123/fail',
      headers: {
        'x-shaktiq-internal-key': internalKey,
      },
      payload: {
        errorCode: 'WORKFLOW_FAILED',
        errorMessage: 'Connection timeout',
      },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe('failed');
    expect(json.data.errorCode).toBe('WORKFLOW_FAILED');
  });

  it('simulates analyze 500 when configured', async () => {
    stubState.simulateAnalyze500 = true;
    const res = await app.inject({
      method: 'POST',
      url: '/internal/runs/run-123/analyze',
      headers: {
        'x-shaktiq-internal-key': internalKey,
      },
      payload: {},
    });

    expect(res.statusCode).toBe(500);
  });
});
