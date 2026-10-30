import type { ChangeType } from '@shaktiq/shared';

export type TemplateContent = {
  impact: string;
  recommendation: string;
};

export const TEMPLATES: Record<ChangeType, TemplateContent> = {
  ENDPOINT_REMOVED: {
    impact: 'Clients calling this endpoint will receive 404 Not Found or 405 Method Not Allowed.',
    recommendation:
      'Restore the endpoint or deprecate first and communicate a sunset date to consumers.',
  },
  METHOD_REMOVED: {
    impact: 'Clients attempting this HTTP method will receive 405 Method Not Allowed.',
    recommendation:
      'Restore the HTTP method or deprecate it across multiple release cycles before removal.',
  },
  REQUIRED_REQUEST_FIELD_ADDED: {
    impact:
      'Existing clients omitting this newly required field will receive 400 Bad Request or 422 Unprocessable Entity.',
    recommendation: 'Make the new field optional or supply a default value on the server side.',
  },
  REQUIRED_PARAMETER_ADDED: {
    impact:
      'Requests without this required parameter will fail validation and be rejected by the server.',
    recommendation:
      'Make the parameter optional or provide a backward-compatible default fallback.',
  },
  RESPONSE_FIELD_REMOVED: {
    impact:
      'Clients expecting this response field may experience runtime errors or deserialization failures.',
    recommendation:
      'Retain the field in responses or coordinate a phased migration with downstream consumers.',
  },
  FIELD_TYPE_CHANGED: {
    impact:
      'Client deserializers and type parsers expecting the previous data type will fail when processing payloads.',
    recommendation: 'Retain the original data type or introduce a new versioned endpoint/field.',
  },
  FIELD_MADE_REQUIRED: {
    impact:
      'Existing payloads lacking this previously optional field will fail validation with 400 or 422 errors.',
    recommendation:
      'Keep the field optional or support legacy payloads without enforcing requirement.',
  },
  RESPONSE_SCHEMA_CHANGED: {
    impact:
      'Downstream consumers expecting the previous response schema structure may fail to parse payload responses.',
    recommendation:
      'Ensure backward compatibility with the previous response schema or version the resource.',
  },
  PARAMETER_CHANGED: {
    impact:
      'Changes to parameter constraints, location, or format may cause requests to fail server-side validation.',
    recommendation:
      'Ensure the new parameter specification is backward compatible with existing requests.',
  },
  ENDPOINT_ADDED: {
    impact: 'Additive non-breaking change. New capability is available for API consumers.',
    recommendation: 'Document the new endpoint in consumer integration guides and API references.',
  },
  OPTIONAL_FIELD_ADDED: {
    impact:
      'Additive non-breaking change. Existing clients continue functioning without modification.',
    recommendation:
      'Document the optional field and specify default behavior when the field is omitted.',
  },
  OTHER: {
    impact: 'Potential discrepancy in API behavior or specification definitions.',
    recommendation:
      'Review the changelog and verify downstream consumers are not adversely affected.',
  },
};

export function getTemplate(changeType: ChangeType): TemplateContent {
  return TEMPLATES[changeType] ?? TEMPLATES.OTHER;
}
