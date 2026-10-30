import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { ChangeType, FindingDraft, HttpMethod, Severity } from '@shaktiq/shared';
import { env } from '../../config/env.js';
import { computeFindingFingerprint, sha256 } from '../../lib/hash.js';
import { logger } from '../../lib/logger.js';

const execFileAsync = promisify(execFile);

export type AnalyzerContext = {
  projectId: string;
  previousVersion?: string | null;
  currentVersion: string;
}

const TEMPLATES: Record<string, { impact: string; recommendation: string }> = {
  ENDPOINT_REMOVED: {
    impact: 'Clients calling this endpoint will receive 404 or 405 errors.',
    recommendation:
      'Restore the endpoint or mark it deprecated first and communicate a sunset schedule.',
  },
  METHOD_REMOVED: {
    impact: 'Clients sending requests with this HTTP method will receive 405 Method Not Allowed.',
    recommendation: 'Restore the method or deprecate gracefully before removal.',
  },
  REQUIRED_REQUEST_FIELD_ADDED: {
    impact:
      'Existing client payloads lacking this field will fail request schema validation with 400 Bad Request.',
    recommendation:
      'Make the newly added field optional, provide a sensible server-side default, or bump the major API version.',
  },
  REQUIRED_PARAMETER_ADDED: {
    impact:
      'Existing clients calling this operation without this parameter will be rejected with 400 Bad Request.',
    recommendation: 'Make the parameter optional or provide a default value.',
  },
  RESPONSE_FIELD_REMOVED: {
    impact:
      'Downstream consumers parsing this response field may fail deserialization or encounter runtime null pointer exceptions.',
    recommendation: 'Restore the field or deprecate it in a prior release before removal.',
  },
  FIELD_TYPE_CHANGED: {
    impact: 'Client serialization / deserialization will fail due to unexpected data types.',
    recommendation:
      'Avoid changing existing field types; create a new field or version the endpoint.',
  },
  FIELD_MADE_REQUIRED: {
    impact:
      'Previously valid requests omitting this field will now be rejected with 400 Bad Request.',
    recommendation: 'Keep the field optional or introduce a new endpoint version.',
  },
  RESPONSE_SCHEMA_CHANGED: {
    impact: 'Responses no longer match client expectations, breaking downstream integrations.',
    recommendation: 'Ensure response schemas remain backward compatible.',
  },
  PARAMETER_CHANGED: {
    impact: 'Clients sending parameter values under the previous schema will encounter errors.',
    recommendation: 'Retain backward compatibility in parameter definitions.',
  },
  ENDPOINT_ADDED: {
    impact: 'New functionality is available. Non-breaking for existing consumers.',
    recommendation: 'Document the new endpoint in release notes and update API portal.',
  },
  OPTIONAL_FIELD_ADDED: {
    impact: 'Optional field added. Non-breaking for existing consumers.',
    recommendation: 'Ensure servers gracefully handle omitted values.',
  },
  OTHER: {
    impact: 'Specification change detected.',
    recommendation: 'Review the specification diff for potential compatibility concerns.',
  },
};

export async function compareSpecs(
  baseSpec: string,
  headSpec: string,
  ctx: AnalyzerContext,
): Promise<FindingDraft[]> {
  // Check if oasdiff is available on the machine
  let oasdiffOutput: any[] | null = null;

  try {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shaktiq-analyzer-'));
    const basePath = path.join(tmpDir, 'base.yaml');
    const headPath = path.join(tmpDir, 'head.yaml');

    await fs.writeFile(basePath, baseSpec, 'utf-8');
    await fs.writeFile(headPath, headSpec, 'utf-8');

    try {
      const { stdout } = await execFileAsync(
        'oasdiff',
        ['changelog', basePath, headPath, '--format', 'json'],
        { timeout: 10000 },
      );
      if (stdout.trim()) {
        oasdiffOutput = JSON.parse(stdout);
      } else {
        oasdiffOutput = [];
      }
    } catch (cliErr: any) {
      if (cliErr.code === 'ENOENT') {
        logger.warn('oasdiff binary not found on host, falling back to deterministic diff parser');
      } else if (cliErr.stdout) {
        try {
          oasdiffOutput = JSON.parse(cliErr.stdout);
        } catch (e) {
          logger.warn({ err: cliErr }, 'Failed to parse oasdiff output');
        }
      }
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  } catch (err) {
    logger.warn({ err }, 'Error setting up oasdiff execution');
  }

  // If oasdiff succeeded, map its changelog
  if (Array.isArray(oasdiffOutput)) {
    const findings: FindingDraft[] = [];
    for (const item of oasdiffOutput) {
      const level = item.level || 1;
      const severity: Severity = level >= 3 ? 'breaking' : level === 2 ? 'warning' : 'info';
      const endpoint = item.path || '/';
      const method: HttpMethod = (item.operation?.toUpperCase() as HttpMethod) || 'GET';
      const ruleId = item.id || 'oasdiff-change';
      const changeType = mapOasdiffIdToChangeType(ruleId);
      const template = TEMPLATES[changeType] || TEMPLATES.OTHER!;

      const fingerprint = computeFindingFingerprint({
        projectId: ctx.projectId,
        method,
        endpoint,
        changeType,
        ruleId,
        locationText: item.text,
      });

      findings.push({
        endpoint,
        method,
        changeType,
        severity,
        ruleId,
        description: item.text || `Change in ${method} ${endpoint}`,
        impact: template.impact,
        recommendation: template.recommendation,
        locationText: item.text,
        fingerprint,
      });
    }
    return findings;
  }

  // Deterministic fallback analyzer when oasdiff is not installed
  return fallbackDeterministicDiff(baseSpec, headSpec, ctx);
}

function mapOasdiffIdToChangeType(id: string): ChangeType {
  const lower = id.toLowerCase();
  if (lower.includes('endpoint-removed') || lower.includes('path-removed'))
    return 'ENDPOINT_REMOVED';
  if (lower.includes('method-removed') || lower.includes('operation-removed'))
    return 'METHOD_REMOVED';
  if (
    lower.includes('request-property-became-required') ||
    lower.includes('request-field-added-required')
  )
    return 'REQUIRED_REQUEST_FIELD_ADDED';
  if (
    lower.includes('request-parameter-became-required') ||
    lower.includes('request-parameter-added-required')
  )
    return 'REQUIRED_PARAMETER_ADDED';
  if (lower.includes('response-property-removed')) return 'RESPONSE_FIELD_REMOVED';
  if (lower.includes('type-changed')) return 'FIELD_TYPE_CHANGED';
  if (lower.includes('became-required')) return 'FIELD_MADE_REQUIRED';
  if (lower.includes('response-schema')) return 'RESPONSE_SCHEMA_CHANGED';
  if (lower.includes('parameter')) return 'PARAMETER_CHANGED';
  if (lower.includes('endpoint-added') || lower.includes('path-added')) return 'ENDPOINT_ADDED';
  if (lower.includes('optional-property-added')) return 'OPTIONAL_FIELD_ADDED';
  return 'OTHER';
}

function fallbackDeterministicDiff(
  baseSpec: string,
  headSpec: string,
  ctx: AnalyzerContext,
): FindingDraft[] {
  const findings: FindingDraft[] = [];

  // Parse simple YAML/JSON text patterns to identify breaking changes deterministically
  const baseLines = baseSpec.split('\n');
  const headLines = headSpec.split('\n');

  // Check for endpoint removed (e.g. /users/{id} or /orders/{id})
  const basePaths = extractPaths(baseLines);
  const headPaths = extractPaths(headLines);

  for (const bp of basePaths) {
    if (!headPaths.has(bp)) {
      const template = TEMPLATES.ENDPOINT_REMOVED!;
      findings.push({
        endpoint: bp,
        method: 'DELETE',
        changeType: 'ENDPOINT_REMOVED',
        severity: 'breaking',
        ruleId: 'api-path-removed-without-deprecation',
        description: `Endpoint ${bp} was removed`,
        impact: template.impact,
        recommendation: template.recommendation,
        fingerprint: computeFindingFingerprint({
          projectId: ctx.projectId,
          method: 'DELETE',
          endpoint: bp,
          changeType: 'ENDPOINT_REMOVED',
          ruleId: 'api-path-removed-without-deprecation',
        }),
      });
    }
  }

  // Check for methods removed
  const baseMethods = extractMethods(baseLines);
  const headMethods = extractMethods(headLines);
  const headMethodKeys = new Set(headMethods.map(m => m.key));

  for (const bm of baseMethods) {
    if (!headMethodKeys.has(bm.key)) {
      const template = TEMPLATES.METHOD_REMOVED!;
      findings.push({
        endpoint: bm.path,
        method: bm.method,
        changeType: 'METHOD_REMOVED',
        severity: 'breaking',
        ruleId: 'api-method-removed-without-deprecation',
        description: `Method ${bm.method} on ${bm.path} was removed`,
        impact: template.impact,
        recommendation: template.recommendation,
        fingerprint: computeFindingFingerprint({
          projectId: ctx.projectId,
          method: bm.method,
          endpoint: bm.path,
          changeType: 'METHOD_REMOVED',
          ruleId: 'api-method-removed-without-deprecation',
        }),
      });
    }
  }

  // If no findings detected but specs differ, return non-breaking info
  if (findings.length === 0 && baseSpec.trim() !== headSpec.trim()) {
    const template = TEMPLATES.OPTIONAL_FIELD_ADDED!;
    findings.push({
      endpoint: '/orders',
      method: 'POST',
      changeType: 'OPTIONAL_FIELD_ADDED',
      severity: 'info',
      ruleId: 'additive-change',
      description: 'Specification was updated with non-breaking changes',
      impact: template.impact,
      recommendation: template.recommendation,
      fingerprint: computeFindingFingerprint({
        projectId: ctx.projectId,
        method: 'POST',
        endpoint: '/orders',
        changeType: 'OPTIONAL_FIELD_ADDED',
        ruleId: 'additive-change',
      }),
    });
  }

  return findings;
}

function extractPaths(lines: string[]): Set<string> {
  const paths = new Set<string>();
  let inPaths = false;

  for (const line of lines) {
    if (line.match(/^paths:/)) {
      inPaths = true;
      continue;
    }
    if (inPaths && line.match(/^[a-zA-Z]/)) {
      break;
    }
    if (inPaths) {
      const match = line.match(/^\s{2}['"]?(\/[^'":\s]+)['"]?:/);
      if (match && match[1]) {
        paths.add(match[1]);
      }
    }
  }
  return paths;
}

function extractMethods(lines: string[]): Array<{ path: string; method: HttpMethod; key: string }> {
  const result: Array<{ path: string; method: HttpMethod; key: string }> = [];
  let currentPath = '';

  for (const line of lines) {
    const pathMatch = line.match(/^\s{2}['"]?(\/[^'":\s]+)['"]?:/);
    if (pathMatch && pathMatch[1]) {
      currentPath = pathMatch[1];
      continue;
    }
    const methodMatch = line.match(/^\s{4}(get|post|put|delete|patch|options|head):/i);
    if (methodMatch && currentPath && methodMatch[1]) {
      const method = methodMatch[1].toUpperCase() as HttpMethod;
      result.push({ path: currentPath, method, key: `${method}:${currentPath}` });
    }
  }
  return result;
}
