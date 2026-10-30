import crypto from 'node:crypto';

export function sha256(input: string | Buffer): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function verifyGithubWebhookSignature(
  secret: string,
  rawBody: Buffer | string | undefined,
  signatureHeader?: string,
): boolean {
  if (!signatureHeader || !rawBody) {
    return false;
  }

  const expectedPrefix = 'sha256=';
  if (!signatureHeader.startsWith(expectedPrefix)) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf-8') : rawBody);
  const expectedSignature = expectedPrefix + hmac.digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
  const receivedBuffer = Buffer.from(signatureHeader, 'utf-8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function timingSafeStringCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function computeFindingFingerprint(params: {
  projectId: string;
  method: string;
  endpoint: string;
  changeType: string;
  ruleId: string;
  locationText?: string;
}): string {
  const parts = [
    params.projectId,
    params.method.toUpperCase(),
    params.endpoint,
    params.changeType,
    params.ruleId,
    params.locationText || '',
  ];
  return sha256(parts.join('|'));
}
