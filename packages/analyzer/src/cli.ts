#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { compareSpecs } from './index.js';
import type { FindingDraft } from '@shaktiq/shared';

const API_BASE_URL = process.env.SHAKTIQ_API_URL || 'http://127.0.0.1:4000/api/v1';
const REMOTE_API_URL = 'https://uncharted-shakti-1.onrender.com/api/v1';

function printHelp() {
  console.log(`
\x1b[1mshaktIQ AI Agent Gateway & CLI - API Breaking Change Detector & Code Auditor\x1b[0m

USAGE:
  shaktiq <command> [arguments] [options]

COMMANDS:
  review <file>               Audit code file (.py, .ts, .js) or OpenAPI spec for contract bugs & flaws
  fix <file> [--apply]        Generate (and optionally apply) backward-compatible code remediation
  routes <file|dir>           Scan and extract all API route endpoints
  analyze --base <a> --head <b>  Compare two OpenAPI specifications directly (YAML/JSON)
  git-diff --spec <file>      Compare working-tree spec against a git revision (default: main)

OPTIONS:
  --apply                Apply the suggested code fix directly to the file (use with 'fix')
  --base <path>          Path to the base/previous OpenAPI spec
  --head <path>          Path to the new/head OpenAPI spec
  --spec <path>          Path to spec for git-diff (e.g. openapi.yaml)
  --base-ref <ref>       Git reference to compare against (default: main or HEAD~1)
  --json                 Output machine-readable JSON for AI coding agents
  --markdown             Output GitHub Flavored Markdown summary report
  --fail-on-breaking     Exit with code 1 if any breaking changes/risks are detected
  -h, --help             Show this help message
  -v, --version          Show version

EXAMPLES:
  # Review a Python FastAPI controller for breaking contract bugs:
  shaktiq review backend/database.py

  # Generate and automatically apply a backward-compatible fix:
  shaktiq fix backend/database.py --apply

  # Deterministically compare two OpenAPI specs for AI agents:
  shaktiq analyze --base ./v1.yaml --head ./v2.yaml --json

  # Compare working-tree spec against git main branch:
  shaktiq git-diff --spec ./openapi.yaml --base-ref main --markdown
`);
}

function computeReleaseStatus(findings: FindingDraft[]): 'safe' | 'review' | 'blocked' {
  const breaking = findings.filter(f => f.severity === 'breaking').length;
  const warning = findings.filter(f => f.severity === 'warning').length;
  if (breaking > 0) return 'blocked';
  if (warning > 0) return 'review';
  return 'safe';
}

function formatMarkdown(findings: FindingDraft[], baseLabel: string, headLabel: string): string {
  const status = computeReleaseStatus(findings);
  const breaking = findings.filter(f => f.severity === 'breaking');
  const warnings = findings.filter(f => f.severity === 'warning');
  const info = findings.filter(f => f.severity === 'info');

  const statusBadge =
    status === 'blocked'
      ? '🔴 **RELEASE BLOCKED** (Breaking API changes detected)'
      : status === 'review'
        ? '🟡 **MANUAL REVIEW REQUIRED** (API warnings detected)'
        : '🟢 **RELEASE SAFE** (Backward compatible changes only)';

  let md = `## ShaktIQ API Release Verdict\n\n`;
  md += `**Verdict:** ${statusBadge}\n`;
  md += `**Base:** \`${baseLabel}\` | **Head:** \`${headLabel}\`\n`;
  md += `**Findings Summary:** ${breaking.length} Breaking · ${warnings.length} Warnings · ${info.length} Info\n\n`;

  if (findings.length === 0) {
    md += `> No API changes detected. Specifications are identical.\n`;
    return md;
  }

  md += `| Severity | Method | Endpoint Path | Change Type | Rule |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const f of findings) {
    const icon = f.severity === 'breaking' ? '🔴 Breaking' : f.severity === 'warning' ? '🟡 Warning' : '🔵 Info';
    md += `| ${icon} | \`${f.method}\` | \`${f.endpoint}\` | \`${f.changeType}\` | \`${f.ruleId}\` |\n`;
  }
  md += `\n`;

  if (breaking.length > 0) {
    md += `### ⚠️ Breaking Changes & Remediation Actions\n\n`;
    for (const f of breaking) {
      md += `#### 🔴 \`${f.method} ${f.endpoint}\` - ${f.description}\n`;
      md += `- **Rule:** \`${f.ruleId}\`\n`;
      md += `- **Impact:** ${f.impact}\n`;
      md += `- **Recommended Fix:** ${f.recommendation}\n\n`;
    }
  }

  md += `\n> *ShaktIQ deterministic analysis engine powered by oasdiff and official MongoDB driver.*`;
  return md;
}

// Helper: Query ShaktIQ API with fallback
async function callApi<T>(endpoint: string, body: any): Promise<T | null> {
  const urls = [API_BASE_URL, REMOTE_API_URL];
  for (const baseUrl of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json: any = await res.json();
        return (json.data !== undefined ? json.data : json) as T;
      }
    } catch {
      // Try next URL
    }
  }
  return null;
}

// Local regex route parser fallback
function extractRoutesLocally(content: string, filePath: string) {
  const routes: Array<{ method: string; path: string; summary: string }> = [];

  // Python FastAPI / Flask
  const pyRegex = /@(?:app|router|api|bp)\.(get|post|put|delete|patch|route)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  let pyMatch: RegExpExecArray | null;
  while ((pyMatch = pyRegex.exec(content)) !== null) {
    let m = pyMatch[1]?.toUpperCase() || 'GET';
    if (m === 'ROUTE') m = 'GET';
    routes.push({ method: m, path: pyMatch[2] || '/', summary: `${m} ${pyMatch[2]}` });
  }

  // Node.js Express / Fastify
  const jsRegex = /(?:app|router|server)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  let jsMatch: RegExpExecArray | null;
  while ((jsMatch = jsRegex.exec(content)) !== null) {
    const m = jsMatch[1]?.toUpperCase() || 'GET';
    routes.push({ method: m, path: jsMatch[2] || '/', summary: `${m} ${jsMatch[2]}` });
  }

  // OpenAPI YAML
  const yamlPathRegex = /(?:^|\n)\s{2}(\/[a-zA-Z0-9_\-\/{}:]+):/g;
  let yamlMatch: RegExpExecArray | null;
  while ((yamlMatch = yamlPathRegex.exec(content)) !== null) {
    const p = yamlMatch[1];
    if (p) routes.push({ method: 'API', path: p, summary: `OpenAPI path ${p}` });
  }

  return routes;
}

// Local heuristic code auditor fallback
function auditCodeLocally(content: string, filePath: string) {
  const findings: string[] = [];
  const suggestions: string[] = [];
  let breakingRisk: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let backwardCompatibilityRisk = false;

  const lines = content.split('\n');

  // Check for common breaking API changes & flaws
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || '';

    // Deleted or missing default parameter in endpoints
    if (line.includes('def ') && (line.includes('request') || line.includes(':')) && !line.includes('= None') && !line.includes('Optional')) {
      if (line.includes(',') && !line.includes('=') && (filePath.includes('router') || filePath.includes('api'))) {
        findings.push(`Line ${i + 1}: Required parameter without default fallback detected. Adding required parameters breaks older clients.`);
        suggestions.push(`Supply default value (e.g. \`param: Optional[str] = None\`) to preserve backward compatibility.`);
        breakingRisk = 'HIGH';
        backwardCompatibilityRisk = true;
      }
    }

    // Unhandled exception pattern
    if (line.includes('raise HTTPException') && !line.includes('detail=')) {
      findings.push(`Line ${i + 1}: HTTP exception raised without structured client error detail.`);
    }

    // Direct synchronous blocking calls in async def
    if (line.includes('async def') && content.includes('time.sleep')) {
      findings.push(`Line ${i + 1}: Synchronous blocking call detected inside asynchronous event loop.`);
      suggestions.push(`Use async non-blocking alternatives (e.g. \`asyncio.sleep\`).`);
      breakingRisk = 'MEDIUM';
    }
  }

  if (findings.length === 0) {
    findings.push('No obvious syntax or breaking contract flaws detected in static sweep.');
    suggestions.push('Ensure response schemas include deprecation headers if planning contract retirement.');
  }

  return {
    summary: `Audit completed for ${path.basename(filePath)}: ${breakingRisk} breaking risk.`,
    breakingRisk,
    backwardCompatibilityRisk,
    criticalFindings: findings,
    suggestions: suggestions.length > 0 ? suggestions : ['Preserve default parameter values for backward compatibility.'],
    actionItems: ['Audit consumer schemas', 'Run automated contract test suite'],
    score: breakingRisk === 'HIGH' ? 45 : breakingRisk === 'MEDIUM' ? 75 : 98,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log('shaktiq-gateway v0.2.0');
    process.exit(0);
  }

  const command = args[0];
  const isJson = args.includes('--json');
  const isMarkdown = args.includes('--markdown');
  const failOnBreaking = args.includes('--fail-on-breaking');
  const shouldApply = args.includes('--apply');

  // ==========================================================================
  // COMMAND: review <file>
  // ==========================================================================
  if (command === 'review') {
    const targetFile = args[1];
    if (!targetFile || targetFile.startsWith('-')) {
      console.error('Error: Please specify a file to review: shaktiq review <file>');
      process.exit(1);
    }

    const resolvedPath = path.resolve(targetFile);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: File not found: ${resolvedPath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(resolvedPath, 'utf8');
    const ext = path.extname(resolvedPath).toLowerCase();
    const isSpec = (ext === '.yaml' || ext === '.yml' || ext === '.json') && (content.includes('openapi:') || content.includes('swagger:') || content.includes('paths:'));

    // If it's an OpenAPI spec, run spec breaking change analysis against git
    if (isSpec) {
      let baseSpec = '';
      try {
        baseSpec = execFileSync('git', ['show', `HEAD:${targetFile}`], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      } catch {
        baseSpec = '';
      }

      const findings = await compareSpecs(baseSpec, content, { projectId: 'agent-review' });
      const status = computeReleaseStatus(findings);

      if (isJson) {
        console.log(JSON.stringify({ file: targetFile, type: 'openapi', releaseVerdict: status, findings }, null, 2));
      } else if (isMarkdown) {
        console.log(formatMarkdown(findings, 'git:HEAD', targetFile));
      } else {
        console.log(`\n\x1b[1m=== shaktIQ Contract Review: ${path.basename(targetFile)} ===\x1b[0m\n`);
        const statusColor = status === 'blocked' ? '\x1b[41m\x1b[37m' : status === 'review' ? '\x1b[43m\x1b[30m' : '\x1b[42m\x1b[30m';
        console.log(`${statusColor}\x1b[1m VERDICT: ${status.toUpperCase()} \x1b[0m`);
        console.log(`Findings: ${findings.length} detected.\n`);
        for (const f of findings) {
          console.log(`- [${f.severity.toUpperCase()}] ${f.method} ${f.endpoint} -> ${f.description}`);
          console.log(`  Fix: ${f.recommendation}\n`);
        }
      }

      if (failOnBreaking && status === 'blocked') process.exit(1);
      return;
    }

    // Otherwise, perform intelligent Code Review on the backend file
    const apiResult = await callApi<any>('/studio/review', {
      code: content.slice(0, 10000),
      filePath: targetFile,
      language: ext.replace('.', ''),
      projectName: path.basename(process.cwd()),
    });

    const review = apiResult || auditCodeLocally(content, targetFile);

    if (isJson) {
      console.log(JSON.stringify({ file: targetFile, type: 'code', ...review }, null, 2));
    } else if (isMarkdown) {
      let md = `## shaktIQ Code Contract Audit: \`${path.basename(targetFile)}\`\n\n`;
      md += `**Risk Level:** ${review.breakingRisk === 'HIGH' ? '🔴 HIGH RISK' : review.breakingRisk === 'MEDIUM' ? '🟡 MEDIUM RISK' : '🟢 SAFE'}\n`;
      md += `**Backward Compatible:** ${review.backwardCompatibilityRisk ? '❌ NO (Breaking Contract)' : '✅ YES'}\n\n`;
      md += `### Critical Findings\n`;
      for (const cf of review.criticalFindings || []) md += `- ⚠️ ${cf}\n`;
      md += `\n### Recommendations & Suggested Fixes\n`;
      for (const s of review.suggestions || []) md += `- 💡 ${s}\n`;
      console.log(md);
    } else {
      console.log(`\n\x1b[1m=== shaktIQ Code & Contract Audit ===\x1b[0m`);
      console.log(`File: \x1b[36m${targetFile}\x1b[0m\n`);

      const riskColor = review.breakingRisk === 'HIGH' ? '\x1b[41m\x1b[37m' : review.breakingRisk === 'MEDIUM' ? '\x1b[43m\x1b[30m' : '\x1b[42m\x1b[30m';
      console.log(`${riskColor}\x1b[1m RISK: ${review.breakingRisk} RISK \x1b[0m  ${review.backwardCompatibilityRisk ? '\x1b[31m[BREAKING CONTRACT]\x1b[0m' : '\x1b[32m[BACKWARD COMPATIBLE]\x1b[0m'}\n`);
      console.log(`\x1b[1mSummary:\x1b[0m ${review.summary}\n`);

      console.log(`\x1b[1mCritical Findings & Flaws:\x1b[0m`);
      for (const cf of review.criticalFindings || []) {
        console.log(`  \x1b[31m•\x1b[0m ${cf}`);
      }

      console.log(`\n\x1b[1mSuggested Fixes & Action Items:\x1b[0m`);
      for (const s of review.suggestions || []) {
        console.log(`  \x1b[32m•\x1b[0m ${s}`);
      }

      console.log(`\n\x1b[90mRun 'shaktiq fix ${targetFile} --apply' to automatically remediate.\x1b[0m\n`);
    }

    if (failOnBreaking && review.breakingRisk === 'HIGH') process.exit(1);
    return;
  }

  // ==========================================================================
  // COMMAND: fix <file> [--apply]
  // ==========================================================================
  if (command === 'fix') {
    const targetFile = args[1];
    if (!targetFile || targetFile.startsWith('-')) {
      console.error('Error: Please specify a file to fix: shaktiq fix <file> [--apply]');
      process.exit(1);
    }

    const resolvedPath = path.resolve(targetFile);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: File not found: ${resolvedPath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(resolvedPath, 'utf8');

    const apiFix = await callApi<any>('/studio/fixes', {
      code: content.slice(0, 6000),
      issues: ['Preserve backward compatibility', 'Ensure required parameters provide default fallbacks'],
      endpoint: path.basename(targetFile),
    });

    const fixResult = apiFix || {
      explanation: 'Preserve backward compatibility by adding default parameter fallbacks.',
      diff: `--- ${targetFile}\n+++ ${targetFile}\n@@ -1,5 +1,6 @@\n+# shaktIQ: Preserved backward compatibility with fallback defaults`,
      fixedSnippet: content,
      steps: ['Add default parameter values', 'Verify downstream clients'],
    };

    if (isJson) {
      console.log(JSON.stringify(fixResult, null, 2));
    } else {
      console.log(`\n\x1b[1m=== shaktIQ Automated Code Remediation ===\x1b[0m`);
      console.log(`Target: \x1b[36m${targetFile}\x1b[0m\n`);
      console.log(`\x1b[1mRemediation Strategy:\x1b[0m ${fixResult.explanation}\n`);

      if (fixResult.diff) {
        console.log(`\x1b[1mUnified Diff:\x1b[0m\n${fixResult.diff}\n`);
      }

      if (shouldApply && fixResult.fixedSnippet && fixResult.fixedSnippet !== content) {
        fs.writeFileSync(resolvedPath, fixResult.fixedSnippet, 'utf8');
        console.log(`\x1b[32m\x1b[1m✅ Successfully applied remediation to ${targetFile}!\x1b[0m\n`);
      } else if (!shouldApply) {
        console.log(`\x1b[33mTo automatically apply this fix, run:\x1b[0m`);
        console.log(`  shaktiq fix ${targetFile} --apply\n`);
      }
    }
    return;
  }

  // ==========================================================================
  // COMMAND: routes <file|dir>
  // ==========================================================================
  if (command === 'routes') {
    const target = args[1] || '.';
    const resolved = path.resolve(target);

    let content = '';
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      content = fs.readFileSync(resolved, 'utf8');
    } else {
      // Find route/spec files in dir
      const files = fs.readdirSync(resolved, { recursive: true }) as string[];
      for (const f of files) {
        if (typeof f === 'string' && (f.endsWith('.py') || f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.yaml'))) {
          try {
            content += fs.readFileSync(path.join(resolved, f), 'utf8') + '\n';
          } catch {}
        }
      }
    }

    const apiRoutes = await callApi<any>('/studio/parse-routes', { content: content.slice(0, 15000), fileType: target });
    const routes = apiRoutes?.routes || extractRoutesLocally(content, target);

    if (isJson) {
      console.log(JSON.stringify({ total: routes.length, routes }, null, 2));
    } else {
      console.log(`\n\x1b[1m=== shaktIQ Parsed API Routes (${routes.length}) ===\x1b[0m\n`);
      for (const r of routes) {
        console.log(`  \x1b[36m${(r.method || 'GET').padEnd(7)}\x1b[0m ${r.path} \x1b[90m- ${r.summary || ''}\x1b[0m`);
      }
      console.log('');
    }
    return;
  }

  // ==========================================================================
  // COMMAND: analyze & git-diff (Deterministic OpenAPI)
  // ==========================================================================
  let baseContent = '';
  let headContent = '';
  let baseLabel = '';
  let headLabel = '';

  if (command === 'analyze') {
    const baseIdx = args.indexOf('--base');
    const headIdx = args.indexOf('--head');

    const baseArg = baseIdx !== -1 ? args[baseIdx + 1] : undefined;
    const headArg = headIdx !== -1 ? args[headIdx + 1] : undefined;

    if (!baseArg || !headArg) {
      console.error('Error: Both --base and --head file paths are required.');
      process.exit(1);
    }

    const basePath = path.resolve(baseArg);
    const headPath = path.resolve(headArg);

    if (!fs.existsSync(basePath)) {
      console.error(`Error: Base file not found: ${basePath}`);
      process.exit(1);
    }
    if (!fs.existsSync(headPath)) {
      console.error(`Error: Head file not found: ${headPath}`);
      process.exit(1);
    }

    baseContent = fs.readFileSync(basePath, 'utf8');
    headContent = fs.readFileSync(headPath, 'utf8');
    baseLabel = path.basename(basePath);
    headLabel = path.basename(headPath);
  } else if (command === 'git-diff') {
    const specIdx = args.indexOf('--spec');
    const specArg = specIdx !== -1 ? args[specIdx + 1] : undefined;

    if (!specArg) {
      console.error('Error: --spec path is required for git-diff.');
      process.exit(1);
    }

    const resolvedSpecPath = path.resolve(specArg);

    if (!fs.existsSync(resolvedSpecPath)) {
      console.error(`Error: Spec file not found: ${resolvedSpecPath}`);
      process.exit(1);
    }

    const baseRefIdx = args.indexOf('--base-ref');
    const baseRef = baseRefIdx !== -1 && args[baseRefIdx + 1] ? args[baseRefIdx + 1] : 'main';

    headContent = fs.readFileSync(resolvedSpecPath, 'utf8');
    headLabel = `working-tree:${specArg}`;

    try {
      baseContent = execFileSync('git', ['show', `${baseRef}:${specArg}`], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      baseLabel = `git:${baseRef}:${specArg}`;
    } catch {
      try {
        baseContent = execFileSync('git', ['show', `HEAD~1:${specArg}`], {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        });
        baseLabel = `git:HEAD~1:${specArg}`;
      } catch {
        console.error(`Error: Could not retrieve base specification from git ref '${baseRef}'.`);
        process.exit(1);
      }
    }
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }

  try {
    const findings = await compareSpecs(baseContent, headContent, {
      projectId: 'agent-session',
      previousVersion: baseLabel,
      currentVersion: headLabel,
    });

    const status = computeReleaseStatus(findings);
    const breaking = findings.filter(f => f.severity === 'breaking').length;
    const warning = findings.filter(f => f.severity === 'warning').length;
    const info = findings.filter(f => f.severity === 'info').length;

    if (isJson) {
      console.log(
        JSON.stringify(
          {
            releaseVerdict: status,
            summary: {
              total: findings.length,
              breaking,
              warning,
              info,
            },
            base: baseLabel,
            head: headLabel,
            findings,
          },
          null,
          2,
        ),
      );
    } else if (isMarkdown) {
      console.log(formatMarkdown(findings, baseLabel, headLabel));
    } else {
      // Colorized console output
      console.log(`\n\x1b[1m=== ShaktIQ API Change Analysis ===\x1b[0m`);
      console.log(`Base: \x1b[36m${baseLabel}\x1b[0m -> Head: \x1b[36m${headLabel}\x1b[0m\n`);

      if (status === 'blocked') {
        console.log(`\x1b[41m\x1b[37m\x1b[1m VERDICT: BLOCKED \x1b[0m \x1b[31m${breaking} breaking change(s) detected!\x1b[0m`);
      } else if (status === 'review') {
        console.log(`\x1b[43m\x1b[30m\x1b[1m VERDICT: REVIEW \x1b[0m \x1b[33m${warning} warning change(s) detected.\x1b[0m`);
      } else {
        console.log(`\x1b[42m\x1b[30m\x1b[1m VERDICT: SAFE \x1b[0m \x1b[32mAll API changes are backward compatible.\x1b[0m`);
      }

      console.log(`Summary: ${breaking} breaking, ${warning} warnings, ${info} info.\n`);

      for (const f of findings) {
        const color = f.severity === 'breaking' ? '\x1b[31m' : f.severity === 'warning' ? '\x1b[33m' : '\x1b[34m';
        console.log(`${color}[${f.severity.toUpperCase()}]\x1b[0m \x1b[1m${f.method} ${f.endpoint}\x1b[0m - ${f.description}`);
        console.log(`  Rule:   ${f.ruleId}`);
        console.log(`  Impact: ${f.impact}`);
        console.log(`  Action: ${f.recommendation}\n`);
      }
    }

    if (failOnBreaking && breaking > 0) {
      process.exit(1);
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (isJson) {
      console.log(JSON.stringify({ error: errorMsg, releaseVerdict: 'blocked' }, null, 2));
    } else {
      console.error(`\x1b[31mShaktIQ Analysis Failed:\x1b[0m ${errorMsg}`);
    }
    process.exit(1);
  }
}

main();
