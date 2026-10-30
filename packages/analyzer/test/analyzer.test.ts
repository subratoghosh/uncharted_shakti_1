import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHANGE_TYPES, computeReleaseStatus } from '@shaktiq/shared';
import {
  AnalyzerError,
  compareSpecs,
  computeFingerprint,
  getTemplate,
  mapOasdiffLevelToSeverity,
  mapRuleIdToChangeType,
} from '../src/index.js';

const FIXTURES_DIR = path.resolve(__dirname, '../../../fixtures/openapi');

async function readFixture(filename: string): Promise<string> {
  return fs.readFile(path.join(FIXTURES_DIR, filename), 'utf8');
}

describe('packages/analyzer Unit Tests (testing.md §3)', () => {
  const ctx = {
    projectId: 'test-project-123',
    previousVersion: 'v1.0.0',
    currentVersion: 'v2.0.0',
  };

  describe('Analyzer Rules & Fixture Detection', () => {
    it('detects ENDPOINT_REMOVED (breaking) on orders-v2-remove-endpoint.yaml', async () => {
      const base = await readFixture('orders-v1.yaml');
      const head = await readFixture('orders-v2-remove-endpoint.yaml');

      const findings = await compareSpecs(base, head, ctx);
      expect(findings.length).toBeGreaterThan(0);

      const endpointRemoved = findings.find(f => f.changeType === 'ENDPOINT_REMOVED');
      expect(endpointRemoved).toBeDefined();
      expect(endpointRemoved?.severity).toBe('breaking');
      expect(endpointRemoved?.endpoint).toBe('/users/{id}');
      expect(endpointRemoved?.method).toBe('GET');
      expect(endpointRemoved?.ruleId).toBe('api-path-removed-without-deprecation');
    });

    it('detects METHOD_REMOVED (breaking) on orders-v2-remove-method.yaml', async () => {
      const base = await readFixture('orders-v1.yaml');
      const head = await readFixture('orders-v2-remove-method.yaml');

      const findings = await compareSpecs(base, head, ctx);
      const methodRemoved = findings.find(f => f.changeType === 'METHOD_REMOVED');
      expect(methodRemoved).toBeDefined();
      expect(methodRemoved?.severity).toBe('breaking');
      expect(methodRemoved?.endpoint).toBe('/orders/{id}');
      expect(methodRemoved?.method).toBe('DELETE');
      expect(methodRemoved?.ruleId).toBe('api-removed-without-deprecation');
    });

    it('detects REQUIRED_REQUEST_FIELD_ADDED (breaking) on orders-v2-required-field.yaml', async () => {
      const base = await readFixture('orders-v1.yaml');
      const head = await readFixture('orders-v2-required-field.yaml');

      const findings = await compareSpecs(base, head, ctx);
      const requiredField = findings.find(f => f.changeType === 'REQUIRED_REQUEST_FIELD_ADDED');
      expect(requiredField).toBeDefined();
      expect(requiredField?.severity).toBe('breaking');
      expect(requiredField?.endpoint).toBe('/orders');
      expect(requiredField?.method).toBe('POST');
      expect(requiredField?.ruleId).toBe('new-required-request-property');
    });

    it('detects REQUIRED_PARAMETER_ADDED (breaking) on orders-v2-required-param.yaml', async () => {
      const base = await readFixture('orders-v1.yaml');
      const head = await readFixture('orders-v2-required-param.yaml');

      const findings = await compareSpecs(base, head, ctx);
      const requiredParam = findings.find(f => f.changeType === 'REQUIRED_PARAMETER_ADDED');
      expect(requiredParam).toBeDefined();
      expect(requiredParam?.severity).toBe('breaking');
      expect(requiredParam?.endpoint).toBe('/orders');
      expect(requiredParam?.method).toBe('GET');
      expect(requiredParam?.ruleId).toBe('new-required-request-parameter');
    });

    it('detects RESPONSE_FIELD_REMOVED (breaking) on orders-v2-response-field-removed.yaml', async () => {
      const base = await readFixture('orders-v1.yaml');
      const head = await readFixture('orders-v2-response-field-removed.yaml');

      const findings = await compareSpecs(base, head, ctx);
      const respFieldRemoved = findings.find(f => f.changeType === 'RESPONSE_FIELD_REMOVED');
      expect(respFieldRemoved).toBeDefined();
      expect(respFieldRemoved?.severity).toBe('breaking');
      expect(respFieldRemoved?.ruleId).toBe('response-required-property-removed');
    });

    it('detects FIELD_TYPE_CHANGED (breaking) on orders-v2-type-change.yaml', async () => {
      const base = await readFixture('orders-v1.yaml');
      const head = await readFixture('orders-v2-type-change.yaml');

      const findings = await compareSpecs(base, head, ctx);
      const typeChanged = findings.find(f => f.changeType === 'FIELD_TYPE_CHANGED');
      expect(typeChanged).toBeDefined();
      expect(typeChanged?.severity).toBe('breaking');
    });

    it('detects FIELD_MADE_REQUIRED (breaking) on orders-v2-optional-to-required.yaml', async () => {
      const base = await readFixture('orders-v1.yaml');
      const head = await readFixture('orders-v2-optional-to-required.yaml');

      const findings = await compareSpecs(base, head, ctx);
      const madeRequired = findings.find(f => f.changeType === 'FIELD_MADE_REQUIRED');
      expect(madeRequired).toBeDefined();
      expect(madeRequired?.severity).toBe('breaking');
    });

    it('detects only info findings (safe) on orders-v2-additive.yaml', async () => {
      const base = await readFixture('orders-v1.yaml');
      const head = await readFixture('orders-v2-additive.yaml');

      const findings = await compareSpecs(base, head, ctx);
      expect(findings.length).toBeGreaterThan(0);
      const hasBreakingOrWarning = findings.some(
        f => f.severity === 'breaking' || f.severity === 'warning',
      );
      expect(hasBreakingOrWarning).toBe(false);

      const endpointAdded = findings.find(f => f.changeType === 'ENDPOINT_ADDED');
      expect(endpointAdded).toBeDefined();
      expect(endpointAdded?.severity).toBe('info');

      const optionalAdded = findings.find(f => f.changeType === 'OPTIONAL_FIELD_ADDED');
      expect(optionalAdded).toBeDefined();
      expect(optionalAdded?.severity).toBe('info');

      const releaseStatus = computeReleaseStatus({
        breaking: findings.filter(f => f.severity === 'breaking').length,
        warning: findings.filter(f => f.severity === 'warning').length,
        info: findings.filter(f => f.severity === 'info').length,
      });
      expect(releaseStatus).toBe('safe');
    });
  });

  describe('Level and Rule ID Mappings', () => {
    it('maps level 3 to breaking, 2 to warning, 1 to info', () => {
      expect(mapOasdiffLevelToSeverity(3)).toBe('breaking');
      expect(mapOasdiffLevelToSeverity(2)).toBe('warning');
      expect(mapOasdiffLevelToSeverity(1)).toBe('info');
    });

    it('maps known and unknown rule IDs', () => {
      expect(mapRuleIdToChangeType('api-path-removed-without-deprecation')).toBe(
        'ENDPOINT_REMOVED',
      );
      expect(mapRuleIdToChangeType('new-required-request-property')).toBe(
        'REQUIRED_REQUEST_FIELD_ADDED',
      );
      expect(mapRuleIdToChangeType('unknown-random-rule')).toBe('OTHER');
    });
  });

  describe('Analyzer Fingerprint Stability', () => {
    it('produces identical fingerprint for identical inputs', () => {
      const fp1 = computeFingerprint({
        projectId: 'proj-1',
        method: 'POST',
        path: '/orders',
        changeType: 'REQUIRED_REQUEST_FIELD_ADDED',
        ruleId: 'new-required-request-property',
        location: 'line 43:17',
      });
      const fp2 = computeFingerprint({
        projectId: 'proj-1',
        method: 'POST',
        path: '/orders',
        changeType: 'REQUIRED_REQUEST_FIELD_ADDED',
        ruleId: 'new-required-request-property',
        location: 'line 43:17',
      });
      expect(fp1).toBe(fp2);
      expect(fp1).toHaveLength(64);
    });

    it('produces different fingerprint when method or path differs', () => {
      const fpPost = computeFingerprint({
        projectId: 'proj-1',
        method: 'POST',
        path: '/orders',
        changeType: 'FIELD_TYPE_CHANGED',
        ruleId: 'type-changed',
        location: '1:1',
      });
      const fpGet = computeFingerprint({
        projectId: 'proj-1',
        method: 'GET',
        path: '/orders',
        changeType: 'FIELD_TYPE_CHANGED',
        ruleId: 'type-changed',
        location: '1:1',
      });
      expect(fpPost).not.toBe(fpGet);
    });
  });

  describe('Analyzer Templates', () => {
    it('provides non-empty impact and recommendation for every ChangeType', () => {
      for (const changeType of CHANGE_TYPES) {
        const tpl = getTemplate(changeType);
        expect(tpl.impact).toBeDefined();
        expect(tpl.impact.length).toBeGreaterThan(10);
        expect(tpl.recommendation).toBeDefined();
        expect(tpl.recommendation.length).toBeGreaterThan(10);
      }
    });
  });

  describe('Analyzer Failures & Boundary Defense', () => {
    it('throws SPEC_INVALID on broken YAML', async () => {
      const base = await readFixture('orders-v1.yaml');
      const broken = await readFixture('broken.yaml');

      await expect(compareSpecs(base, broken, ctx)).rejects.toThrow(AnalyzerError);
      await expect(compareSpecs(base, broken, ctx)).rejects.toThrow(
        /OpenAPI specification is invalid/i,
      );
    });

    it('throws SPEC_INVALID when spec contains remote $ref', async () => {
      const base = await readFixture('orders-v1.yaml');
      const remoteRefSpec = `
openapi: 3.0.3
info:
  title: Test
  version: 1.0.0
paths:
  /test:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: 'https://evil.com/schemas/malicious.yaml'
`;
      await expect(compareSpecs(base, remoteRefSpec, ctx)).rejects.toThrow(AnalyzerError);
      await expect(compareSpecs(base, remoteRefSpec, ctx)).rejects.toThrow(/prohibited/i);
    });

    it('throws SPEC_TOO_LARGE when spec exceeds 5 MB', async () => {
      const base = await readFixture('orders-v1.yaml');
      const largeSpec =
        'openapi: 3.0.3\ninfo:\n  title: Huge\n  version: 1.0.0\n# ' + 'a'.repeat(6 * 1024 * 1024);

      await expect(compareSpecs(base, largeSpec, ctx)).rejects.toThrow(AnalyzerError);
      await expect(compareSpecs(base, largeSpec, ctx)).rejects.toThrow(
        /exceeds maximum allowed limit/i,
      );
    });

    it('throws ANALYSIS_FAILED when timeout is reached', async () => {
      const base = await readFixture('orders-v1.yaml');
      const head = await readFixture('orders-v2-additive.yaml');

      // Set timeout to 1ms to trigger timeout
      await expect(compareSpecs(base, head, ctx, { timeoutMs: 1 })).rejects.toThrow(AnalyzerError);
    });
  });

  describe('Release Status Logic (docs/database.md §6)', () => {
    it('returns blocked if breaking > 0', () => {
      expect(computeReleaseStatus({ breaking: 1, warning: 0, info: 5 })).toBe('blocked');
      expect(computeReleaseStatus({ breaking: 2, warning: 3, info: 0 })).toBe('blocked');
    });

    it('returns review if warning > 0 and breaking === 0', () => {
      expect(computeReleaseStatus({ breaking: 0, warning: 1, info: 10 })).toBe('review');
    });

    it('returns safe if breaking === 0 and warning === 0', () => {
      expect(computeReleaseStatus({ breaking: 0, warning: 0, info: 4 })).toBe('safe');
      expect(computeReleaseStatus({ breaking: 0, warning: 0, info: 0 })).toBe('safe');
    });
  });
});
