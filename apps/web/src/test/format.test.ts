import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, formatRelative, shortSha, escapeText } from '../lib/format';

describe('format utilities', () => {
  it('formats dates consistently', () => {
    const iso = '2026-10-30T12:00:00.000Z';
    expect(formatDate(iso)).toBeTruthy();
    expect(formatDateShort(iso)).toContain('2026');
  });

  it('shortens commit SHAs to 7 characters', () => {
    expect(shortSha('abcdef1234567890')).toBe('abcdef1');
    expect(shortSha(null)).toBe('—');
    expect(shortSha(undefined)).toBe('—');
  });

  it('escapes spec-derived untrusted text safely', () => {
    const malicious = '<script>alert("xss")</script> & "quotes"';
    const escaped = escapeText(malicious);
    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &quot;quotes&quot;');
    expect(escaped).not.toContain('<');
    expect(escaped).not.toContain('>');
  });

  it('formats relative times correctly', () => {
    const now = new Date().toISOString();
    expect(formatRelative(now)).toMatch(/s ago/);
  });
});
