#!/usr/bin/env node

import readline from 'node:readline';
import { execFileSync } from 'node:child_process';
import { compareSpecs } from './index.js';
import type { FindingDraft } from '@shaktiq/shared';

function computeReleaseStatus(findings: FindingDraft[]): 'safe' | 'review' | 'blocked' {
  const breaking = findings.filter(f => f.severity === 'breaking').length;
  const warning = findings.filter(f => f.severity === 'warning').length;
  if (breaking > 0) return 'blocked';
  if (warning > 0) return 'review';
  return 'safe';
}

const TOOLS = [
  {
    name: 'shaktiq_analyze',
    description:
      'Deterministically compare two OpenAPI specifications (base vs head) and detect breaking changes, warnings, and release verdict (SAFE, REVIEW, BLOCKED).',
    inputSchema: {
      type: 'object',
      properties: {
        base_spec: {
          type: 'string',
          description: 'The raw YAML or JSON content of the base/original OpenAPI specification.',
        },
        head_spec: {
          type: 'string',
          description: 'The raw YAML or JSON content of the head/modified OpenAPI specification.',
        },
      },
      required: ['base_spec', 'head_spec'],
    },
  },
  {
    name: 'shaktiq_git_diff',
    description:
      'Compare an OpenAPI spec in the working tree against a base git ref (e.g. main or HEAD~1) to detect breaking changes before committing.',
    inputSchema: {
      type: 'object',
      properties: {
        spec_path: {
          type: 'string',
          description: 'Path to the OpenAPI specification file (e.g. openapi.yaml).',
        },
        base_ref: {
          type: 'string',
          description: 'Git reference to compare against (default: main).',
        },
      },
      required: ['spec_path'],
    },
  },
];

async function handleToolCall(name: string, args: Record<string, any>) {
  if (name === 'shaktiq_analyze') {
    const { base_spec, head_spec } = args;
    const findings = await compareSpecs(base_spec, head_spec, {
      projectId: 'mcp-session',
    });
    const status = computeReleaseStatus(findings);
    const breaking = findings.filter(f => f.severity === 'breaking').length;
    const warning = findings.filter(f => f.severity === 'warning').length;
    const info = findings.filter(f => f.severity === 'info').length;

    return {
      releaseVerdict: status,
      summary: { total: findings.length, breaking, warning, info },
      findings,
    };
  }

  if (name === 'shaktiq_git_diff') {
    const { spec_path, base_ref = 'main' } = args;
    const headContent = execFileSync('cat', [spec_path], { encoding: 'utf8' });
    let baseContent = '';
    try {
      baseContent = execFileSync('git', ['show', `${base_ref}:${spec_path}`], { encoding: 'utf8' });
    } catch {
      baseContent = execFileSync('git', ['show', `HEAD~1:${spec_path}`], { encoding: 'utf8' });
    }

    const findings = await compareSpecs(baseContent, headContent, {
      projectId: 'mcp-git-session',
    });
    const status = computeReleaseStatus(findings);
    const breaking = findings.filter(f => f.severity === 'breaking').length;
    const warning = findings.filter(f => f.severity === 'warning').length;
    const info = findings.filter(f => f.severity === 'info').length;

    return {
      releaseVerdict: status,
      specPath: spec_path,
      baseRef: base_ref,
      summary: { total: findings.length, breaking, warning, info },
      findings,
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', async line => {
    if (!line.trim()) return;

    try {
      const msg = JSON.parse(line);
      const { id, method, params } = msg;

      if (method === 'initialize') {
        const response = {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'shaktiq-mcp-server', version: '0.1.0' },
          },
        };
        console.log(JSON.stringify(response));
        return;
      }

      if (method === 'notifications/initialized') {
        return;
      }

      if (method === 'tools/list') {
        const response = {
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS },
        };
        console.log(JSON.stringify(response));
        return;
      }

      if (method === 'tools/call') {
        const { name, arguments: toolArgs } = params;
        const result = await handleToolCall(name, toolArgs);
        const response = {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          },
        };
        console.log(JSON.stringify(response));
        return;
      }

      // Default response for unhandled method
      console.log(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method '${method}' not found` },
        }),
      );
    } catch (err: unknown) {
      console.error('MCP Error:', err);
    }
  });
}

main();

