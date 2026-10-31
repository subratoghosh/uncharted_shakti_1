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
