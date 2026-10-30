export const MAX_SPEC_BYTES = 5 * 1024 * 1024; // 5 MB

export class AnalyzerError extends Error {
  constructor(
    public readonly code: 'SPEC_TOO_LARGE' | 'SPEC_INVALID' | 'ANALYSIS_FAILED',
    message: string,
  ) {
    super(message);
    this.name = 'AnalyzerError';
  }
}

/**
 * Validates spec string before execution:
 * 1. Checks size limit (5 MB)
 * 2. Checks for remote $refs (http:// or https://)
 * 3. Checks for non-empty string
 */
export function validateSpecContent(specText: string, label: 'base' | 'head'): void {
  if (typeof specText !== 'string' || specText.trim().length === 0) {
    throw new AnalyzerError('SPEC_INVALID', `${label} spec is empty or invalid string`);
  }

  const byteLength = Buffer.byteLength(specText, 'utf8');
  if (byteLength > MAX_SPEC_BYTES) {
    throw new AnalyzerError(
      'SPEC_TOO_LARGE',
      `${label} spec size (${byteLength} bytes) exceeds maximum allowed limit of ${MAX_SPEC_BYTES} bytes`,
    );
  }

  // Reject specs containing remote $ref (http:// or https://)
  // Check regex for $ref: "http..." or "$ref": "http..."
  const remoteRefPattern = /["']?\$ref["']?\s*:\s*["']https?:\/\//i;
  if (remoteRefPattern.test(specText)) {
    throw new AnalyzerError(
      'SPEC_INVALID',
      `${label} spec contains remote $ref which is prohibited for security reasons`,
    );
  }
}
