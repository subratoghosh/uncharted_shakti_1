# Graph Report - ShaktIQ  (2026-10-31)

## Corpus Check
- 198 files · ~90,773 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 8, .example 3, .ico 2)

## Summary
- 1158 nodes · 2279 edges · 86 communities (62 shown, 24 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e1ae0bfe`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- api/src/server.ts
- MarketingLayout
- API Diff Analyzer Core
- web/package.json
- Infra Docker Services
- ESLint Linter Configuration
- Package Dependencies (Group 6)
- Auth & Token Models
- Package Dependencies (Group 8)
- apiClient
- TypeScript Compiler Config
- Auth & Token Models
- Package Dependencies (Group 12)
- Auth & Token Models
- API Diff Analyzer Core
- MarketingLayout.tsx
- Auth & Token Models
- API Diff Analyzer Core
- dependencies
- System Subsystem 19
- VS Code Extension
- Run Execution & Verdicts
- internal/routes.ts
- TypeScript Compiler Config
- stub-api/src/server.ts
- api/package.json
- validators/index.ts
- System Subsystem 27
- TypeScript Compiler Config
- TypeScript Compiler Config
- TypeScript Compiler Config
- TypeScript Compiler Config
- Database Migrations & Schemas
- ChangeStreamHub
- VS Code Extension
- TypeScript Compiler Config
- Package Dependencies (Group 36)
- collections.ts
- System Subsystem 38
- Auth & Token Models
- envelope.ts
- System Subsystem 41
- System Subsystem 42
- Run Execution & Verdicts
- System Subsystem 44
- next-auth
- next.config.js
- redis.ts
- app/page.tsx
- lucide-react
- System Subsystem 52
- ShaktIQ AI Agent Skill & Plugin Guide
- /shaktiq - API Breaking Change & Release Intelligence
- Architecture & Specifications
- Architecture & Specifications
- Architecture & Specifications
- /shaktiq - API Breaking Change & Release Intelligence
- Architecture & Specifications
- Architecture & Specifications
- Auth & Token Models
- plugin.yaml
- [1.1.0] - 2026-10-31
- layout.tsx
- register/route.ts
- dotenv@^16.4.7
- finding.ts
- gemini-service.ts
- faq/page.tsx
- install-agent-skill.sh script
- start-n8n.sh
- next-auth.d.ts
- analyzer-service.ts
- background-runner.ts
- @shaktiq/analyzer@*
- hub.ts
- contributes
- notification.ts
- @fastify/cors
- @fastify/rate-limit
- @shaktiq/shared@*
- @upstash/redis@^1.40.0
- zod@^3.24.1

## God Nodes (most connected - your core abstractions)
1. `react` - 64 edges
2. `lucide-react` - 41 edges
3. `next` - 35 edges
4. `apiClient()` - 27 edges
5. `getCollections()` - 23 edges
6. `AppError` - 22 edges
7. `sendSuccess()` - 21 edges
8. `formatDate()` - 19 edges
9. `MarketingLayout()` - 18 edges
10. `Env` - 17 edges

## Surprising Connections (you probably didn't know these)
- `ShaktIQ Extension Brand Icon` --conceptually_related_to--> `VS Code IDE Extension`  [INFERRED]
  apps/vscode-ext/resources/icon.svg → docs/architecture.md
- `main()` --calls--> `generateMultiLayerDossier()`  [EXTRACTED]
  scripts/test-ai-dossier.ts → apps/api/src/modules/ai/gemini-service.ts
- `ShaktIQ Monorepo Root` --references--> `Agent Ownership & Monorepo Governance`  [EXTRACTED]
  README.md → docs/agents.md
- `ShaktIQ Monorepo Root` --references--> `Code Style & Conventional Commits`  [EXTRACTED]
  README.md → docs/code_style.md
- `ShaktIQ Monorepo Root` --references--> `Design System Tokens & Components`  [EXTRACTED]
  README.md → docs/design_system.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core Analysis & Feedback Pipeline** — docs_architecture_fastify_api, docs_architecture_n8n_orchestration, docs_architecture_analyzer_engine, docs_architecture_vscode_extension [EXTRACTED 1.00]

## Communities (86 total, 24 thin omitted)

### Community 0 - "api/src/server.ts"
Cohesion: 0.18
Nodes (32): getCollections(), timingSafeStringCompare(), rateLimitGuard(), sendError(), sendSuccess(), adminRoutes(), authRoutes(), cliAnalyzeSchema (+24 more)

### Community 1 - "MarketingLayout"
Cohesion: 0.11
Nodes (17): IntelligencePage(), metadata, revalidate, metadata, PrivacyPolicyPage(), revalidate, metadata, revalidate (+9 more)

### Community 2 - "API Diff Analyzer Core"
Cohesion: 0.06
Nodes (39): activate(), AnalyzeResponse, execFileAsync, FindingItem, FindingsTreeDataProvider, FindingTreeItem, computeReleaseStatus(), formatMarkdown() (+31 more)

### Community 3 - "web/package.json"
Cohesion: 0.05
Nodes (49): dependencies, argon2@^0.41.1, clsx@^2.1.1, dotenv@^16.4.7, lucide-react@^0.408.0, mongodb@^6.12.0, next@^14.2.5, next-auth@^4.24.15 (+41 more)

### Community 4 - "Infra Docker Services"
Cohesion: 0.07
Nodes (31): build, container_name, environment, networks, ports, restart, context, dockerfile (+23 more)

### Community 5 - "ESLint Linter Configuration"
Cohesion: 0.06
Nodes (40): dependencies, @upstash/ratelimit@^2.2.0, @upstash/redis@^1.40.0, description, devDependencies, eslint@^8.57.0, prettier@^3.3.3, @types/node@^20.14.0 (+32 more)

### Community 6 - "Package Dependencies (Group 6)"
Cohesion: 0.11
Nodes (22): dependencies, fastify@^4.28.1, @shaktiq/shared@*, devDependencies, tsx@^4.16.2, @types/node@^20.14.0, typescript@^5.5.4, fastify (+14 more)

### Community 7 - "Auth & Token Models"
Cohesion: 0.10
Nodes (20): AiQueryRequest, aiQueryRequestSchema, aiQueryResponseSchema, ApiToken, apiTokenDtoSchema, CreateApiTokenRequest, createApiTokenRequestSchema, CreateApiTokenResponse (+12 more)

### Community 8 - "Package Dependencies (Group 8)"
Cohesion: 0.10
Nodes (22): bin, shaktiq, shaktiq-mcp, dependencies, @shaktiq/shared@*, devDependencies, typescript@^5.5.4, vitest@^1.6.0 (+14 more)

### Community 9 - "apiClient"
Cohesion: 0.06
Nodes (58): AdminEventsPage(), WebhookEvent, AdminOverviewLoading(), AdminOverview, AdminOverviewPage(), AdminProjectsPage(), Project, AdminRunsPage() (+50 more)

### Community 10 - "TypeScript Compiler Config"
Cohesion: 0.11
Nodes (18): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module (+10 more)

### Community 11 - "Auth & Token Models"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

### Community 12 - "Package Dependencies (Group 12)"
Cohesion: 0.12
Nodes (17): dependencies, zod@^3.24.1, description, devDependencies, typescript@^5.7.3, exports, typescript, zod (+9 more)

### Community 13 - "Auth & Token Models"
Cohesion: 0.12
Nodes (16): extends, ignorePatterns, parser, parserOptions, ecmaVersion, sourceType, plugins, root (+8 more)

### Community 14 - "API Diff Analyzer Core"
Cohesion: 0.11
Nodes (21): VS Code Extension User Guide, ShaktIQ Extension Brand Icon, Agent Ownership & Monorepo Governance, oasdiff Semantic & Structural Analyzer, Fastify API Backend Service, n8n Workflow Automation Engine, Next.js Web Frontend Service, ShaktIQ Architecture Overview (+13 more)

### Community 15 - "MarketingLayout.tsx"
Cohesion: 0.21
Nodes (10): LoginForm(), LoginPage(), RegisterPage(), Footer(), Header(), NAV_ITEMS, MarketingMobileNav(), PRIMARY_TABS (+2 more)

### Community 16 - "Auth & Token Models"
Cohesion: 0.14
Nodes (14): devDependencies, mongodb-memory-server@^10.1.3, pino-pretty@^13.0.0, tsx@^4.19.2, @types/jsonwebtoken@^9.0.8, @types/node@^22.10.7, typescript@^5.7.3, vitest@^2.1.8 (+6 more)

### Community 17 - "API Diff Analyzer Core"
Cohesion: 0.12
Nodes (15): SPEC_SOURCES, InternalRunAnalyzeRequest, internalRunAnalyzeRequestSchema, InternalRunAnalyzeResponse, internalRunAnalyzeResponseSchema, InternalRunExplanationsRequest, internalRunExplanationsRequestSchema, InternalRunFailRequest (+7 more)

### Community 18 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, argon2@^0.41.1, fastify@^4.28.1, @fastify/cookie@^9.4.0, fastify-type-provider-zod@^2.0.0, jsonwebtoken@^9.0.2, pino@^9.6.0, @upstash/ratelimit@^2.2.0 (+6 more)

### Community 19 - "System Subsystem 19"
Cohesion: 0.18
Nodes (11): properties, title, configuration, shaktiq.apiUrl, shaktiq.webUrl, default, description, type (+3 more)

### Community 20 - "VS Code Extension"
Cohesion: 0.11
Nodes (17): activationEvents, bugs, url, categories, description, displayName, engines, vscode (+9 more)

### Community 21 - "Run Execution & Verdicts"
Cohesion: 0.18
Nodes (10): AI_STATUSES, RELEASE_STATUSES, CompareRunsQuery, compareRunsQuerySchema, computeReleaseStatus(), CreateManualRunRequest, createManualRunRequestSchema, Run (+2 more)

### Community 22 - "internal/routes.ts"
Cohesion: 0.14
Nodes (16): currentDir, Env, envSchema, parsed, closeDb(), connectDb(), getDb(), createIndexes() (+8 more)

### Community 23 - "TypeScript Compiler Config"
Cohesion: 0.18
Nodes (10): compilerOptions, composite, module, moduleResolution, outDir, rootDir, target, extends (+2 more)

### Community 24 - "stub-api/src/server.ts"
Cohesion: 0.43
Nodes (4): app, recordedCalls, StubCall, stubState

### Community 25 - "api/package.json"
Cohesion: 0.20
Nodes (9): fastify-raw-body@^4.3.0, mongodb@^6.12.0, description, mongodb, main, name, type, version (+1 more)

### Community 26 - "validators/index.ts"
Cohesion: 0.11
Nodes (18): apiTokenValidator, eventValidator, findingValidator, notificationValidator, projectValidator, runValidator, specSnapshotValidator, userValidator (+10 more)

### Community 27 - "System Subsystem 27"
Cohesion: 0.20
Nodes (9): ROLES, LoginRequest, loginRequestSchema, RegisterRequest, registerRequestSchema, UpdateUserRequest, updateUserRequestSchema, User (+1 more)

### Community 28 - "TypeScript Compiler Config"
Cohesion: 0.22
Nodes (8): compilerOptions, composite, outDir, rootDir, extends, include, ../../tsconfig.base.json, references

### Community 29 - "TypeScript Compiler Config"
Cohesion: 0.22
Nodes (8): compilerOptions, composite, outDir, rootDir, extends, include, ../../tsconfig.base.json, references

### Community 30 - "TypeScript Compiler Config"
Cohesion: 0.22
Nodes (8): compilerOptions, composite, outDir, rootDir, extends, include, ../../tsconfig.base.json, references

### Community 31 - "TypeScript Compiler Config"
Cohesion: 0.25
Nodes (7): compilerOptions, composite, outDir, rootDir, extends, include, ../../tsconfig.base.json

### Community 32 - "Database Migrations & Schemas"
Cohesion: 0.22
Nodes (9): scripts, build, db:migrate, dev, start, test, test:ai, test:unit (+1 more)

### Community 34 - "VS Code Extension"
Cohesion: 0.29
Nodes (7): devDependencies, @types/node@^20.14.0, @types/vscode@^1.85.0, typescript@^5.5.4, @types/node, typescript, @types/vscode

### Community 35 - "TypeScript Compiler Config"
Cohesion: 0.29
Nodes (6): compilerOptions, composite, extends, files, ./tsconfig.base.json, references

### Community 36 - "Package Dependencies (Group 36)"
Cohesion: 0.40
Nodes (5): scripts, build, dev, package, typecheck

### Community 37 - "collections.ts"
Cohesion: 0.13
Nodes (19): ApiTokenDoc, EventDoc, FindingDoc, NotificationDoc, ProjectDoc, RunDoc, SpecSnapshotDoc, UserDoc (+11 more)

### Community 38 - "System Subsystem 38"
Cohesion: 0.50
Nodes (4): shaktiq.baseRef, default, description, type

### Community 39 - "Auth & Token Models"
Cohesion: 0.50
Nodes (4): shaktiq.specPath, default, description, type

### Community 40 - "envelope.ts"
Cohesion: 0.13
Nodes (13): ERROR_CODES, ERROR_HTTP_STATUS_MAP, ErrorCode, ErrorDetail, ApiErrorPayload, apiErrorSchema, apiFailureEnvelopeSchema, ApiFailureResponse (+5 more)

### Community 42 - "System Subsystem 42"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 45 - "next-auth"
Cohesion: 0.20
Nodes (14): PullToRefresh(), PullToRefreshProps, AppShell(), ConsoleMobileNav(), adminNav, Sidebar(), userNav, TopNav() (+6 more)

### Community 47 - "redis.ts"
Cohesion: 0.18
Nodes (13): analyzeRateLimiter, authRateLimiter, cacheGet(), cacheSet(), createRateLimiter(), generalApiLimiter, getRedisClient(), MemoryCacheRecord (+5 more)

### Community 48 - "app/page.tsx"
Cohesion: 0.08
Nodes (41): AiReleaseDossier, ShaktIQDashboard(), handleCreateProject(), handleCreateToken(), loadAiDossier(), loadProjectDetails(), loadProjects(), loadRunFindings() (+33 more)

### Community 49 - "lucide-react"
Cohesion: 0.27
Nodes (9): LandingPage(), metadata, CallToAction(), FEATURE_MODULES, FeatureModules(), Hero(), TrustStrip(), WhyShaktiq() (+1 more)

### Community 53 - "ShaktIQ AI Agent Skill & Plugin Guide"
Cohesion: 0.15
Nodes (12): 1. In-Flight Git Diff (Between Code Edits), 1. What Exactly Is This Called?, 2. Machine-Readable JSON for AI Agents, 2. Why AI Agents Need This Between Code Execution, 3. How We Built This (Architecture & Mechanics), 4. How to Install and Set It Up, 5. Usage Examples, 6. Release Verdict Reference (+4 more)

### Community 54 - "/shaktiq - API Breaking Change & Release Intelligence"
Cohesion: 0.18
Nodes (10): 1. In-Between Code Writing Verification (Git Diff), 2. Compare Two Specification Files Directly, 5. Natural Language AI Assistant (Powered by Gemini 3.8 Flash), Agent Remediation Playbook, Command Reference, MCP Server Integration, Output Schema & How to Interpret Results, /shaktiq - API Breaking Change & Release Intelligence (+2 more)

### Community 58 - "/shaktiq - API Breaking Change & Release Intelligence"
Cohesion: 0.18
Nodes (10): 1. In-Between Code Writing Verification (Git Diff), 2. Compare Two Specification Files Directly, 5. Natural Language AI Assistant (Powered by Gemini 3.8 Flash), Agent Remediation Playbook, Command Reference, MCP Server Integration, Output Schema & How to Interpret Results, /shaktiq - API Breaking Change & Release Intelligence (+2 more)

### Community 62 - "plugin.yaml"
Cohesion: 0.25
Nodes (7): author, description, name, provides_commands, provides_skills, provides_tools, version

### Community 63 - "[1.1.0] - 2026-10-31"
Cohesion: 0.29
Nodes (6): [1.0.0] - 2026-10-30, [1.1.0] - 2026-10-31, Added, Changed, Changelog, Initial Release

### Community 64 - "layout.tsx"
Cohesion: 0.21
Nodes (7): metadata, RootLayout(), CacheEntry, PageCacheContext, PageCacheContextType, PageCacheProvider(), Providers()

### Community 65 - "register/route.ts"
Cohesion: 0.17
Nodes (10): handler, POST(), authOptions, clientPromise, connectWithFallback(), getClientPromise(), getDb(), checkRateLimit() (+2 more)

### Community 67 - "finding.ts"
Cohesion: 0.20
Nodes (9): CHANGE_TYPES, DIFF_STATUSES, HTTP_METHODS, SEVERITIES, Finding, findingDraftSchema, findingDtoSchema, Hotspot (+1 more)

### Community 68 - "gemini-service.ts"
Cohesion: 0.11
Nodes (23): @google/genai@^2.32.0, CodeFixInput, CodeFixOutput, CodeReviewInput, CodeReviewOutput, CommitMessageInput, CommitMessageOutput, FindingAnalysisInput (+15 more)

### Community 69 - "faq/page.tsx"
Cohesion: 0.24
Nodes (7): FAQPage(), metadata, FAQAccordion(), FAQItem, SHAKTIQ_FAQS, config, next

### Community 72 - "start-n8n.sh"
Cohesion: 0.18
Nodes (10): EXECUTIONS_DATA_MAX_AGE, EXECUTIONS_DATA_PRUNE, GITHUB_TOKEN, INTERNAL_API_KEY, N8N_BLOCK_ENV_ACCESS_IN_NODE, N8N_DEFAULT_BINARY_DATA_MODE, N8N_PORT, N8N_WEBHOOK_TOKEN (+2 more)

### Community 73 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 74 - "analyzer-service.ts"
Cohesion: 0.36
Nodes (9): computeFindingFingerprint(), AnalyzerContext, compareSpecs(), execFileAsync, extractMethods(), extractPaths(), fallbackDeterministicDiff(), mapOasdiffIdToChangeType() (+1 more)

### Community 75 - "background-runner.ts"
Cohesion: 0.26
Nodes (13): buildPrCommentMarkdown(), CachedToken, fetchRepositorySpec(), generateAppJwt(), getInstallationAccessToken(), getNormalizedPrivateKey(), postCommitStatus(), postPullRequestComment() (+5 more)

### Community 77 - "hub.ts"
Cohesion: 0.31
Nodes (6): hub, SseListener, Subscriber, SSE_EVENT_TYPES, SseEventType, SseMessage

### Community 78 - "contributes"
Cohesion: 0.33
Nodes (6): contributes, commands, views, viewsContainers, shaktiq-sidebar, activitybar

### Community 79 - "notification.ts"
Cohesion: 0.40
Nodes (4): NOTIFICATION_CHANNELS, NOTIFICATION_STATUSES, Notification, notificationDtoSchema

## Knowledge Gaps
- **36 isolated node(s):** `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `../../tsconfig.base.json`, `../../tsconfig.base.json`, `../../tsconfig.base.json` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 492 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `next-auth` to `layout.tsx`, `MarketingLayout`, `web/package.json`, `faq/page.tsx`, `apiClient`, `MarketingLayout.tsx`, `app/page.tsx`, `lucide-react`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `../../tsconfig.base.json` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MarketingLayout` be split into smaller, more focused modules?**
  _Cohesion score 0.11255411255411256 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `MarketingLayout`, `web/package.json`, `faq/page.tsx`, `apiClient`, `next-auth`, `MarketingLayout.tsx`, `app/page.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `API Diff Analyzer Core` be split into smaller, more focused modules?**
  _Cohesion score 0.06093189964157706 - nodes in this community are weakly interconnected._
- **Why does `next` connect `faq/page.tsx` to `layout.tsx`, `register/route.ts`, `MarketingLayout`, `web/package.json`, `apiClient`, `next-auth`, `MarketingLayout.tsx`, `app/page.tsx`, `lucide-react`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.053061224489795916 - nodes in this community are weakly interconnected._