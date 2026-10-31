#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { compareSpecs } from './index.js';
import type { FindingDraft } from '@shaktiq/shared';

function printHelp() {
  console.log(`
ShaktIQ AI Agent CLI - Deterministic OpenAPI Breaking Change Detector

USAGE:
  shaktiq analyze --base <file> --head <file> [options]
  shaktiq git-diff --spec <file> [--base-ref <ref>] [options]

COMMANDS:
  analyze      Compare two OpenAPI specification files (YAML or JSON)
  git-diff     Compare working tree spec against a git revision (default: main)

OPTIONS:
  --base <path>          Path to the base/previous OpenAPI spec
  --head <path>          Path to the new/head OpenAPI spec
  --spec <path>          Path to spec for git-diff (e.g. openapi.yaml)
  --base-ref <ref>       Git reference to compare against (default: main or HEAD~1)
  --json                 Output machine-readable JSON for AI agent integration
  --markdown             Output GitHub Flavored Markdown summary report
  --fail-on-breaking     Exit with code 1 if any breaking changes are detected
  -h, --help             Show this help message
  -v, --version          Show version

EXAMPLES:
  # Analyze two files and print agent-friendly JSON:
  shaktiq analyze --base ./openapi-v1.yaml --head ./openapi-v2.yaml --json

  # Compare current spec against git main branch:
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

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log('shaktiq-analyzer v0.1.0');
    process.exit(0);
  }

  const command = args[0];
  const isJson = args.includes('--json');
  const isMarkdown = args.includes('--markdown');
  const failOnBreaking = args.includes('--fail-on-breaking');

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
