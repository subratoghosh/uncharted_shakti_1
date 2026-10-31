'use client';

import React, { useState } from 'react';
import {
  FileCode2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Terminal,
  FolderGit2,
} from 'lucide-react';

interface OpenApiGuidanceCardProps {
  compact?: boolean;
  className?: string;
}

export function OpenApiGuidanceCard({ compact = false, className = '' }: OpenApiGuidanceCardProps) {
  const [isOpen, setIsOpen] = useState(!compact);
  const [activeTab, setActiveTab] = useState<'why' | 'generate' | 'placement' | 'nospec'>('why');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const frameworks = [
    {
      name: 'FastAPI / Python',
      badge: 'Auto-generated',
      desc: 'FastAPI generates OpenAPI specs automatically at runtime.',
      command: 'curl http://localhost:8000/openapi.json -o openapi.json',
      tip: 'Or export via Python: `import json; from main import app; json.dump(app.openapi(), open("openapi.json", "w"))`',
    },
    {
      name: 'Express / Node.js',
      badge: '1-Command CLI',
      desc: 'Use swagger-autogen or tsoa to create specs from your route files.',
      command: 'npx swagger-autogen ./openapi.json ./src/routes.ts',
      tip: 'Alternatively, install swagger-jsdoc with JSDoc annotations.',
    },
    {
      name: 'NestJS',
      badge: 'Built-in Swagger',
      desc: 'Use @nestjs/swagger module in your main.ts bootstrap function.',
      command: 'const document = SwaggerModule.createDocument(app, config);',
      tip: 'Navigate to http://localhost:3000/api-json to save the raw JSON/YAML spec.',
    },
    {
      name: 'Spring Boot / Java',
      badge: 'SpringDoc',
      desc: 'Add springdoc-openapi-starter-webmvc-ui to pom.xml or build.gradle.',
      command: 'curl http://localhost:8080/v3/api-docs.yaml -o openapi.yaml',
      tip: 'Automatically reflects all @RestController mappings and models.',
    },
    {
      name: 'Go (Gin / Echo / Chi)',
      badge: 'Swag CLI',
      desc: 'Use swag CLI to parse your Go comments and generate docs/swagger.yaml.',
      command: 'swag init -g cmd/server/main.go -o ./',
      tip: 'Generates swagger.json, swagger.yaml, and docs.go in your root directory.',
    },
  ];

  return (
    <div
      className={`rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-background to-emerald-900/10 p-4 transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <FileCode2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">OpenAPI Spec Guide</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                API Contract Source of Truth
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Why an OpenAPI spec is needed, how to generate it, and where to place it in your repo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 rounded-lg border border-border bg-background/60 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-accent/10 transition-colors"
        >
          {isOpen ? (
            <>
              Hide Guide <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              View Guide <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3.5 space-y-3 pt-3 border-t border-border/60">
          {/* Sub-nav tabs */}
          <div className="flex flex-wrap gap-1 rounded-lg bg-background/80 p-1 border border-border text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('why')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                activeTab === 'why'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              Why It's Needed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                activeTab === 'generate'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Terminal className="h-3 w-3" />
              How to Generate / Get It
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('placement')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                activeTab === 'placement'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FolderGit2 className="h-3 w-3" />
              Where to Place in Repo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nospec')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                activeTab === 'nospec'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              No Spec? Audit Code Directly
            </button>
          </div>

          {/* TAB 1: WHY */}
          {activeTab === 'why' && (
            <div className="space-y-2 rounded-lg bg-background/60 p-3 border border-border/80 text-xs text-foreground">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  1
                </span>
                <p>
                  <strong>Zero-Downtime Contract Protection:</strong> The OpenAPI specification (<code>openapi.yaml</code> or <code>openapi.json</code>) defines your public API contract. shaktIQ compares this against base git branches on every pull request to catch breaking changes before they reach production.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  2
                </span>
                <p>
                  <strong>Prevents Broken Mobile & Web Apps:</strong> Mobile clients (iOS & Android) cannot be updated instantaneously. If a backend engineer removes a field, renames an endpoint, or adds a required parameter, legacy clients crash immediately. shaktIQ guarantees backward compatibility.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  3
                </span>
                <p>
                  <strong>Automated CI/CD Gate:</strong> With your spec committed, shaktIQ GitHub Actions and webhooks block breaking PRs and offer 1-click backward-compatible code remediation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GENERATE */}
          {activeTab === 'generate' && (
            <div className="space-y-2.5 rounded-lg bg-background/60 p-3 border border-border/80 text-xs">
              <p className="text-[11px] text-muted-foreground mb-1">
                Choose your framework below for a quick copy-paste command to produce your <code>openapi.yaml</code> or <code>openapi.json</code>:
              </p>
              <div className="space-y-2">
                {frameworks.map((fw, idx) => (
                  <div key={fw.name} className="rounded-lg border border-border/70 bg-background/90 p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{fw.name}</span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {fw.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{fw.desc}</p>
                    <div className="flex items-center justify-between rounded bg-muted/30 px-2 py-1 font-mono text-[11px]">
                      <span className="truncate pr-2 text-foreground">{fw.command}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(fw.command, idx)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        title="Copy command"
                      >
                        {copiedIndex === idx ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/80 italic">{fw.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PLACEMENT */}
          {activeTab === 'placement' && (
            <div className="space-y-2 rounded-lg bg-background/60 p-3 border border-border/80 text-xs text-foreground">
              <p className="font-semibold text-foreground">Where to save the file in your repository:</p>
              <div className="rounded-lg bg-muted/20 p-2 font-mono text-[11px] space-y-1">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">your-github-repo/</div>
                <div className="pl-4 text-foreground">├── openapi.yaml &nbsp;&nbsp;<span className="text-emerald-600 dark:text-emerald-400 font-sans text-[10px]">← Default recommended location</span></div>
                <div className="pl-4 text-muted-foreground">├── docs/openapi.json &nbsp;&nbsp;<span className="text-muted-foreground font-sans text-[10px]">← Custom path supported</span></div>
                <div className="pl-4 text-muted-foreground">├── src/</div>
                <div className="pl-4 text-muted-foreground">└── package.json / pyproject.toml</div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                In the project settings or GitHub import dialog, you can configure <strong>Spec Path</strong> (e.g. <code>openapi.yaml</code>, <code>openapi.json</code>, or <code>docs/openapi.yaml</code>).
              </p>
            </div>
          )}

          {/* TAB 4: NO SPEC? */}
          {activeTab === 'nospec' && (
            <div className="space-y-2 rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/30 text-xs text-foreground">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>You Can Still Audit Code Directly Without a Spec!</span>
              </div>
              <p>
                Don't have an OpenAPI file right now? <strong>You don't need to block your workflow:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-muted-foreground">
                <li>
                  <strong className="text-foreground">VS Code Extension:</strong> Right-click <em>any file</em> (Python, TypeScript, JavaScript, Go, Java) or <em>any folder</em> in your workspace. Select <strong>"shaktIQ: Analyze API changes & Review Code"</strong> to run an instant contract audit without any spec file.
                </li>
                <li>
                  <strong className="text-foreground">Code Intelligence Studio:</strong> Switch to the <strong>Upload File</strong> or <strong>Paste Code</strong> tab to paste your backend route controllers directly. shaktIQ will extract routes, detect breaking signature risks, and generate AI backward-compatible remediations.
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
