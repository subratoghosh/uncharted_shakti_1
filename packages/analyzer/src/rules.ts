import type { ChangeType, Severity } from '@shaktiq/shared';

/**
 * Map oasdiff severity levels to ShaktIQ severities:
 * Level 3 -> breaking
 * Level 2 -> warning
 * Level 1 -> info
 */
export function mapOasdiffLevelToSeverity(level: number): Severity {
  if (level >= 3) return 'breaking';
  if (level === 2) return 'warning';
  return 'info';
}

/**
 * Map oasdiff rule ID to ShaktIQ ChangeType enum.
 * Fallback to OTHER if unknown.
 */
export const RULE_ID_MAP: Record<string, ChangeType> = {
  // Endpoints & Methods removed
  'api-path-removed-without-deprecation': 'ENDPOINT_REMOVED',
  'api-path-removed': 'ENDPOINT_REMOVED',
  'api-removed-without-deprecation': 'METHOD_REMOVED',
  'api-removed': 'METHOD_REMOVED',

  // Request properties & parameters added as required
  'new-required-request-property': 'REQUIRED_REQUEST_FIELD_ADDED',
  'request-body-became-required': 'REQUIRED_REQUEST_FIELD_ADDED',
  'new-required-request-parameter': 'REQUIRED_PARAMETER_ADDED',
  'new-required-header': 'REQUIRED_PARAMETER_ADDED',
  'new-required-path-parameter': 'REQUIRED_PARAMETER_ADDED',

  // Response properties removed
  'response-required-property-removed': 'RESPONSE_FIELD_REMOVED',
  'response-property-removed': 'RESPONSE_FIELD_REMOVED',

  // Type changes
  'response-property-type-changed': 'FIELD_TYPE_CHANGED',
  'request-property-type-changed': 'FIELD_TYPE_CHANGED',
  'request-parameter-type-changed': 'FIELD_TYPE_CHANGED',
  'header-type-changed': 'FIELD_TYPE_CHANGED',

  // Optional made required
  'request-property-became-required': 'FIELD_MADE_REQUIRED',
  'request-parameter-became-required': 'FIELD_MADE_REQUIRED',

  // Response schema & media changes
  'response-body-type-changed': 'RESPONSE_SCHEMA_CHANGED',
  'response-media-type-removed': 'RESPONSE_SCHEMA_CHANGED',
  'response-success-status-removed': 'RESPONSE_SCHEMA_CHANGED',

  // Parameter modified
  'request-parameter-removed': 'PARAMETER_CHANGED',
  'request-parameter-pattern-changed': 'PARAMETER_CHANGED',
  'request-parameter-max-length-decreased': 'PARAMETER_CHANGED',
  'request-parameter-min-length-increased': 'PARAMETER_CHANGED',

  // Additive / non-breaking
  'endpoint-added': 'ENDPOINT_ADDED',
  'new-optional-request-property': 'OPTIONAL_FIELD_ADDED',
  'response-optional-property-added': 'OPTIONAL_FIELD_ADDED',
  'new-optional-request-parameter': 'OPTIONAL_FIELD_ADDED',
  'optional-request-parameter-added': 'OPTIONAL_FIELD_ADDED',
};

export function mapRuleIdToChangeType(ruleId: string): ChangeType {
  return RULE_ID_MAP[ruleId] ?? 'OTHER';
}
