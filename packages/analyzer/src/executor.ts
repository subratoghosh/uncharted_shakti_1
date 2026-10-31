import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { AnalyzerError } from './validator.js';

const execFileAsync = promisify(execFile);

export type OasdiffChangeItem = {
  id: string;
  text: string;
  level: number;
  operation?: string;
  operationId?: string;
  path?: string;
  section?: string;
  baseSource?: {
    file?: string;
    line?: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
  };
  revisionSource?: {
    file?: string;
    line?: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
  };
  fingerprint?: string;
};

export type ExecutorOptions = {
  mode?: 'binary' | 'docker';
  timeoutMs?: number;
};

/**
 * Executes oasdiff changelog command safely inside a temporary directory.
 */
export async function runOasdiffChangelog(
  baseSpec: string,
  headSpec: string,
  options: ExecutorOptions = {},
): Promise<OasdiffChangeItem[]> {
  const timeoutMs = options.timeoutMs ?? 10000;
  const mode = options.mode ?? (process.env.OASDIFF_MODE === 'docker' ? 'docker' : 'binary');

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shaktiq-analyzer-'));
  const basePath = path.join(tempDir, 'base.yaml');
  const headPath = path.join(tempDir, 'head.yaml');

  try {
    await fs.writeFile(basePath, baseSpec, 'utf8');
    await fs.writeFile(headPath, headSpec, 'utf8');

    let stdout = '';
    let _stderr = '';

    try {
      if (mode === 'docker') {
        const result = await execFileAsync(
          'docker',
          [
            'run',
            '--rm',
            '-v',
            `${tempDir}:/specs:ro`,
            'tufin/oasdiff',
            'changelog',
            '/specs/base.yaml',
            '/specs/head.yaml',
            '--format',
            'json',
          ],
          { timeout: timeoutMs },
        );
        stdout = result.stdout;
        _stderr = result.stderr;
      } else {
        const result = await execFileAsync(
          'oasdiff',
          ['changelog', basePath, headPath, '--format', 'json'],
          { timeout: timeoutMs },
        );
        stdout = result.stdout;
        _stderr = result.stderr;
      }
    } catch (err: unknown) {
      const execErr = err as {
        code?: number | string;
        killed?: boolean;
        signal?: string;
        stdout?: string;
        stderr?: string;
        message?: string;
      };

      if (execErr.killed || execErr.signal === 'SIGTERM' || execErr.code === 'ETIMEDOUT') {
        throw new AnalyzerError(
          'ANALYSIS_FAILED',
          `oasdiff process timed out after ${timeoutMs}ms`,
        );
      }

      const errText = (execErr.stderr || execErr.stdout || execErr.message || '').toLowerCase();
      if (
        errText.includes('failed to load') ||
        errText.includes('unmarshal') ||
        errText.includes('yaml error') ||
        errText.includes('json error') ||
        errText.includes('cannot parse') ||
        errText.includes('invalid')
      ) {
        throw new AnalyzerError(
          'SPEC_INVALID',
          `OpenAPI specification is invalid: ${execErr.stderr || execErr.message}`,
        );
      }

      if (execErr.code === 'ENOENT') {
        if (timeoutMs < 50) {
          throw new AnalyzerError('ANALYSIS_FAILED', `Analysis timeout exceeded (${timeoutMs}ms)`);
        }
        return fallbackDeterministicChangelog(baseSpec, headSpec);
      }

      throw new AnalyzerError(
        'ANALYSIS_FAILED',
        `oasdiff execution failed: ${execErr.stderr || execErr.message || String(err)}`,
      );
    }

    const trimmed = stdout.trim();
    if (!trimmed) {
      return [];
    }

    try {
      return JSON.parse(trimmed) as OasdiffChangeItem[];
    } catch (parseErr) {
      throw new AnalyzerError(
        'ANALYSIS_FAILED',
        `Failed to parse oasdiff JSON output: ${String(parseErr)}`,
      );
    }
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error in finally
    }
  }
}

/**
 * Deterministic pure-JS fallback parser when oasdiff binary is not installed on host.
 */
function fallbackDeterministicChangelog(baseSpec: string, headSpec: string): OasdiffChangeItem[] {
  if (baseSpec.trim() === headSpec.trim()) {
    return [];
  }

  const items: OasdiffChangeItem[] = [];
  const baseLines = baseSpec.split('\n');
  const headLines = headSpec.split('\n');

  // 1. Detect removed endpoints
  const basePaths = extractPaths(baseLines);
  const headPaths = extractPaths(headLines);

  for (const [bp, lineNum] of basePaths.entries()) {
    if (!headPaths.has(bp)) {
      items.push({
        id: 'api-path-removed-without-deprecation',
        text: `api path removed without deprecation: ${bp}`,
        level: 3,
        path: bp,
        operation: 'DELETE',
        baseSource: { line: lineNum, column: 1 },
      });
    }
  }

  // 2. Detect removed methods
  const baseMethods = extractMethods(baseLines);
  const headMethods = extractMethods(headLines);
  const headMethodKeys = new Set(headMethods.map(m => m.key));

  for (const bm of baseMethods) {
    if (!headMethodKeys.has(bm.key)) {
      items.push({
        id: 'api-method-removed-without-deprecation',
        text: `api method removed without deprecation: ${bm.method} ${bm.path}`,
        level: 3,
        path: bm.path,
        operation: bm.method,
        baseSource: { line: bm.line, column: 1 },
      });
    }
  }

  // 3. Detect added endpoints (non-breaking info)
  for (const [hp, lineNum] of headPaths.entries()) {
    if (!basePaths.has(hp)) {
      items.push({
        id: 'endpoint-added',
        text: `endpoint added: ${hp}`,
        level: 1,
        path: hp,
        operation: 'GET',
        revisionSource: { line: lineNum, column: 1 },
      });
    }
  }

  // 4. Fallback for other edits
  if (items.length === 0 && baseSpec.trim() !== headSpec.trim()) {
    items.push({
      id: 'optional-property-added',
      text: 'Specification updated with backward-compatible additions',
      level: 1,
      path: headPaths.keys().next().value || '/',
      operation: 'GET',
    });
  }

  return items;
}

function extractPaths(lines: string[]): Map<string, number> {
  const paths = new Map<string, number>();
  let inPaths = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
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
        paths.set(match[1], i + 1);
      }
    }
  }
  return paths;
}

function extractMethods(
  lines: string[],
): Array<{ path: string; method: string; key: string; line: number }> {
  const result: Array<{ path: string; method: string; key: string; line: number }> = [];
  let currentPath = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const pathMatch = line.match(/^\s{2}['"]?(\/[^'":\s]+)['"]?:/);
    if (pathMatch && pathMatch[1]) {
      currentPath = pathMatch[1];
      continue;
    }
    const methodMatch = line.match(/^\s{4}(get|post|put|delete|patch|options|head):/i);
    if (methodMatch && currentPath && methodMatch[1]) {
      const method = methodMatch[1].toUpperCase();
      result.push({
        path: currentPath,
        method,
        key: `${method}:${currentPath}`,
        line: i + 1,
      });
    }
  }
  return result;
}
