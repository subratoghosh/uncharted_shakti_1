import type { FindingDraft, HttpMethod } from '@shaktiq/shared';
import { HTTP_METHODS } from '@shaktiq/shared';
import { runOasdiffChangelog, type ExecutorOptions } from './executor.js';
import { computeFingerprint } from './fingerprint.js';
import { mapOasdiffLevelToSeverity, mapRuleIdToChangeType } from './rules.js';
import { getTemplate } from './templates.js';
import { validateSpecContent, AnalyzerError } from './validator.js';

export {
  AnalyzerError,
  validateSpecContent,
  computeFingerprint,
  mapOasdiffLevelToSeverity,
  mapRuleIdToChangeType,
  getTemplate,
};

export type AnalyzerContext = {
  projectId: string;
  previousVersion?: string;
  currentVersion?: string;
};

function normalizeMethod(raw?: string): HttpMethod {
  if (!raw) return '*';
  const upper = raw.toUpperCase();
  if ((HTTP_METHODS as readonly string[]).includes(upper)) {
    return upper as HttpMethod;
  }
  return '*';
}

function formatLocationText(item: {
  baseSource?: { line?: number; column?: number };
  revisionSource?: { line?: number; column?: number };
}): string {
  const source = item.revisionSource ?? item.baseSource;
  if (source && source.line !== undefined) {
    return `${source.line}:${source.column ?? 0}`;
  }
  return '';
}

/**
 * Compares two OpenAPI specifications (YAML or JSON) and returns a list of FindingDrafts.
 * Uses oasdiff for deterministic breaking change detection.
 */
export async function compareSpecs(
  baseSpec: string,
  headSpec: string,
  ctx: AnalyzerContext,
  options?: ExecutorOptions,
): Promise<FindingDraft[]> {
  // 1. Validate spec strings (size limits, remote $refs, non-empty)
  validateSpecContent(baseSpec, 'base');
  validateSpecContent(headSpec, 'head');

  // 2. Run oasdiff changelog
  const rawItems = await runOasdiffChangelog(baseSpec, headSpec, options);

  // 3. Map to FindingDraft[]
  const drafts: FindingDraft[] = [];

  for (const item of rawItems) {
    const ruleId = item.id;
    const severity = mapOasdiffLevelToSeverity(item.level);
    const changeType = mapRuleIdToChangeType(ruleId);
    const endpoint = item.path || '/';
    const method = normalizeMethod(item.operation);
    const description = item.text;
    const template = getTemplate(changeType);
    const locationText = formatLocationText(item);

    const fingerprint = computeFingerprint({
      projectId: ctx.projectId,
      method,
      path: endpoint,
      changeType,
      ruleId,
      location: locationText,
    });

    drafts.push({
      fingerprint,
      endpoint,
      method,
      changeType,
      severity,
      ruleId,
      description,
      impact: template.impact,
      recommendation: template.recommendation,
      ...(locationText ? { locationText } : {}),
    });
  }

  return drafts;
}
