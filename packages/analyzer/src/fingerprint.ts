import { createHash } from 'node:crypto';
import type { ChangeType, HttpMethod } from '@shaktiq/shared';

/**
 * Deterministic finding fingerprint:
 * sha256(projectId|METHOD|path|changeType|ruleId|location)
 * Stable across runs so aggregation can diff runs.
 */
export function computeFingerprint(params: {
  projectId: string;
  method: HttpMethod | string;
  path: string;
  changeType: ChangeType;
  ruleId: string;
  location: string;
}): string {
  const methodUpper = (params.method || '*').toUpperCase();
  const normalizedPath = params.path || '/';
  const normalizedRuleId = params.ruleId || 'unknown';
  const normalizedLocation = params.location || '';

  const raw = `${params.projectId}|${methodUpper}|${normalizedPath}|${params.changeType}|${normalizedRuleId}|${normalizedLocation}`;
  return createHash('sha256').update(raw).digest('hex');
}
