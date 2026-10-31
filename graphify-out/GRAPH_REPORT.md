# Graph Report - ShaktIQ  (2026-10-31)

## Corpus Check
- 208 files · ~98,348 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 8, .example 3, .ico 2)

## Summary
- 1225 nodes · 2381 edges · 94 communities (68 shown, 26 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c80d4098`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- extension.ts
- MarketingLayout
- analyzer/src/index.ts
- web/package.json
- Infra Docker Services
- ESLint Linter Configuration
- Package Dependencies (Group 6)
- Auth & Token Models
- Package Dependencies (Group 8)
- react
- TypeScript Compiler Config
- Auth & Token Models
- Package Dependencies (Group 12)
- Auth & Token Models
- API Diff Analyzer Core
- api/src/server.ts
- Auth & Token Models
- API Diff Analyzer Core
- dependencies
- shaktiq.apiUrl
- VS Code Extension
- Run Execution & Verdicts
- executor.ts
- TypeScript Compiler Config
- event.ts
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
- properties
- cli.ts
- envelope.ts
- System Subsystem 41
- System Subsystem 42
- Run Execution & Verdicts
- System Subsystem 44
- next-auth
- next.config.js
- stub-api/src/server.ts
- app/page.tsx
- analyzer-service.ts
- System Subsystem 52
- ShaktIQ AI Agent Skill & Plugin Guide
- /shaktiq - Coding Agent Gateway: API Breaking Change Detection & Automated Remediation
- Architecture & Specifications
- Architecture & Specifications
- Architecture & Specifications
- /shaktiq - Coding Agent Gateway: API Breaking Change Detection & Automated Remediation
- Architecture & Specifications
- Architecture & Specifications
- Auth & Token Models
- plugin.yaml
- [1.1.0] - 2026-10-31
- next
- next-auth
- shaktiq.webUrl
- cli.ts
- gemini-service.ts
- faq/page.tsx
- install-agent-skill.sh script
- start-n8n.sh
- services
- runs/routes.ts
- fastify@^4.28.1
- @shaktiq/analyzer@*
- notification.ts
- contributes
- fastify-type-provider-zod@^2.0.0
- @fastify/cors
- fastify-raw-body
- @upstash/ratelimit@^2.2.0
- mongodb@^6.12.0
- pino
- shared/src/index.ts
- auth/routes.ts
- lib/auth.ts
- background-runner.ts
- next-auth.d.ts
- start-local-mongo.ts
- ai-query.ts
- setup-production-n8n.sh

## God Nodes (most connected - your core abstractions)
1. `react` - 64 edges
2. `lucide-react` - 41 edges
3. `next` - 41 edges
4. `apiClient()` - 28 edges
5. `getCollections()` - 23 edges
6. `AppError` - 22 edges
7. `sendSuccess()` - 21 edges
8. `next-auth` - 19 edges
9. `formatDate()` - 19 edges
10. `MarketingLayout()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `ShaktIQ Extension Brand Icon` --conceptually_related_to--> `VS Code IDE Extension`  [INFERRED]
  apps/vscode-ext/resources/icon.svg → docs/architecture.md
- `start()` --calls--> `sha256()`  [EXTRACTED]
  scripts/start-local-mongo.ts → apps/api/src/lib/hash.ts
- `main()` --calls--> `generateMultiLayerDossier()`  [EXTRACTED]
  scripts/test-ai-dossier.ts → apps/api/src/modules/ai/gemini-service.ts
- `requireInternalKey()` --calls--> `AppError`  [EXTRACTED]
  apps/api/src/plugins/auth.ts → packages/shared/src/errors.ts
- `ShaktIQ Monorepo Root` --references--> `Agent Ownership & Monorepo Governance`  [EXTRACTED]
  README.md → docs/agents.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core Analysis & Feedback Pipeline** — docs_architecture_fastify_api, docs_architecture_n8n_orchestration, docs_architecture_analyzer_engine, docs_architecture_vscode_extension [EXTRACTED 1.00]

## Communities (94 total, 26 thin omitted)

### Community 0 - "extension.ts"
Cohesion: 0.09
Nodes (11): ActionsTreeDataProvider, activate(), CodeFixResult, CodeReviewResult, DetectedRoute, execFileAsync, fetchFromApi(), FindingItem (+3 more)

### Community 1 - "MarketingLayout"
Cohesion: 0.11
Nodes (19): IntelligencePage(), metadata, revalidate, metadata, PrivacyPolicyPage(), revalidate, metadata, revalidate (+11 more)

### Community 2 - "analyzer/src/index.ts"
Cohesion: 0.16
Nodes (17): computeFingerprint(), AnalyzerContext, compareSpecs(), formatLocationText(), normalizeMethod(), mapOasdiffLevelToSeverity(), mapRuleIdToChangeType(), RULE_ID_MAP (+9 more)

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
Cohesion: 0.12
Nodes (17): ApiToken, apiTokenDtoSchema, CreateApiTokenRequest, createApiTokenRequestSchema, CreateApiTokenResponse, createApiTokenResponseSchema, objectIdSchema, PaginationQuery (+9 more)

### Community 8 - "Package Dependencies (Group 8)"
Cohesion: 0.10
Nodes (22): bin, shaktiq, shaktiq-mcp, dependencies, @shaktiq/shared@*, devDependencies, typescript@^5.5.4, vitest@^1.6.0 (+14 more)

### Community 9 - "react"
Cohesion: 0.06
Nodes (69): AdminEventsPage(), WebhookEvent, AdminOverviewLoading(), AdminOverview, AdminOverviewPage(), AdminProjectsPage(), Project, AdminRunsPage() (+61 more)

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

### Community 15 - "api/src/server.ts"
Cohesion: 0.19
Nodes (13): currentDir, Env, envSchema, parsed, closeDb(), connectDb(), getDb(), verifyGithubWebhookSignature() (+5 more)

### Community 16 - "Auth & Token Models"
Cohesion: 0.14
Nodes (14): devDependencies, mongodb-memory-server@^10.1.3, pino-pretty@^13.0.0, tsx@^4.19.2, @types/jsonwebtoken@^9.0.8, @types/node@^22.10.7, typescript@^5.7.3, vitest@^2.1.8 (+6 more)

### Community 17 - "API Diff Analyzer Core"
Cohesion: 0.12
Nodes (15): SPEC_SOURCES, InternalRunAnalyzeRequest, internalRunAnalyzeRequestSchema, InternalRunAnalyzeResponse, internalRunAnalyzeResponseSchema, InternalRunExplanationsRequest, internalRunExplanationsRequestSchema, InternalRunFailRequest (+7 more)

### Community 18 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, dotenv@^16.4.7, @fastify/cookie@^9.4.0, @fastify/rate-limit@^9.1.0, @google/genai@^2.32.0, jsonwebtoken@^9.0.2, @shaktiq/shared@*, zod@^3.24.1 (+6 more)

### Community 19 - "shaktiq.apiUrl"
Cohesion: 0.50
Nodes (4): shaktiq.apiUrl, default, description, type

### Community 20 - "VS Code Extension"
Cohesion: 0.11
Nodes (17): activationEvents, bugs, url, categories, description, displayName, engines, vscode (+9 more)

### Community 21 - "Run Execution & Verdicts"
Cohesion: 0.17
Nodes (11): AI_STATUSES, RELEASE_STATUSES, RUN_STATUSES, CompareRunsQuery, compareRunsQuerySchema, computeReleaseStatus(), CreateManualRunRequest, createManualRunRequestSchema (+3 more)

### Community 22 - "executor.ts"
Cohesion: 0.29
Nodes (7): execFileAsync, ExecutorOptions, extractMethods(), extractPaths(), fallbackDeterministicChangelog(), OasdiffChangeItem, runOasdiffChangelog()

### Community 23 - "TypeScript Compiler Config"
Cohesion: 0.18
Nodes (10): compilerOptions, composite, module, moduleResolution, outDir, rootDir, target, extends (+2 more)

### Community 24 - "event.ts"
Cohesion: 0.20
Nodes (9): EVENT_TYPES, PROCESSING_STATUSES, SOURCES, Event, eventDtoSchema, EventPayloadSubset, eventPayloadSubsetSchema, WebhookDeliveryResponse (+1 more)

### Community 25 - "api/package.json"
Cohesion: 0.20
Nodes (9): argon2@^0.41.1, @upstash/redis@^1.40.0, description, argon2, @upstash/redis, main, name, type (+1 more)

### Community 26 - "validators/index.ts"
Cohesion: 0.29
Nodes (9): VALIDATORS_MAP, apiTokenValidator, eventValidator, findingValidator, notificationValidator, projectValidator, runValidator, specSnapshotValidator (+1 more)

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
Cohesion: 0.11
Nodes (20): AiStatus, CHANGE_TYPES, DIFF_STATUSES, DiffStatus, EventType, HTTP_METHODS, NotificationChannel, NotificationStatus (+12 more)

### Community 38 - "properties"
Cohesion: 0.18
Nodes (11): properties, title, configuration, shaktiq.baseRef, shaktiq.specPath, default, description, type (+3 more)

### Community 39 - "cli.ts"
Cohesion: 0.28
Nodes (4): computeReleaseStatus(), handleToolCall(), main(), TOOLS

### Community 40 - "envelope.ts"
Cohesion: 0.17
Nodes (13): ERROR_CODES, ERROR_HTTP_STATUS_MAP, ErrorCode, ErrorDetail, ApiErrorPayload, apiErrorSchema, apiFailureEnvelopeSchema, ApiFailureResponse (+5 more)

### Community 42 - "System Subsystem 42"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 45 - "next-auth"
Cohesion: 0.10
Nodes (19): metadata, RootLayout(), CacheEntry, PageCacheContext, PageCacheContextType, PageCacheProvider(), PullToRefresh(), PullToRefreshProps (+11 more)

### Community 47 - "stub-api/src/server.ts"
Cohesion: 0.27
Nodes (5): app, recordedCalls, StubCall, stubState, FindingDraft

### Community 48 - "app/page.tsx"
Cohesion: 0.10
Nodes (32): DashboardPage(), AiReleaseDossier(), AiReleaseDossierProps, BlastRadiusMatrix(), BlastRadiusMatrixProps, getBadgeClass(), CodeIntelligenceStudioProps, MOCK_COMMITS (+24 more)

### Community 49 - "analyzer-service.ts"
Cohesion: 0.17
Nodes (18): computeFindingFingerprint(), sha256(), timingSafeStringCompare(), cliAnalyzeSchema, AnalyzerContext, compareSpecs(), execFileAsync, extractMethods() (+10 more)

### Community 53 - "ShaktIQ AI Agent Skill & Plugin Guide"
Cohesion: 0.15
Nodes (12): 1. In-Flight Git Diff (Between Code Edits), 1. What Exactly Is This Called?, 2. Machine-Readable JSON for AI Agents, 2. Why AI Agents Need This Between Code Execution, 3. How We Built This (Architecture & Mechanics), 4. How to Install and Set It Up, 5. Usage Examples, 6. Release Verdict Reference (+4 more)

### Community 54 - "/shaktiq - Coding Agent Gateway: API Breaking Change Detection & Automated Remediation"
Cohesion: 0.15
Nodes (12): 1. Audit Code for Contract Bugs & Flaws, 2. Auto-Remediate Code Flaws (Generate & Apply Fix), 3. Extract API Routes, 4. Deterministic OpenAPI Specification Comparison, Add to your Agent's MCP Configuration:, Agent Remediation Playbook, Available MCP Tools:, Capabilities for AI Coding Agents (+4 more)

### Community 58 - "/shaktiq - Coding Agent Gateway: API Breaking Change Detection & Automated Remediation"
Cohesion: 0.15
Nodes (12): 1. Audit Code for Contract Bugs & Flaws, 2. Auto-Remediate Code Flaws (Generate & Apply Fix), 3. Extract API Routes, 4. Deterministic OpenAPI Specification Comparison, Add to your Agent's MCP Configuration:, Agent Remediation Playbook, Available MCP Tools:, Capabilities for AI Coding Agents (+4 more)

### Community 62 - "plugin.yaml"
Cohesion: 0.25
Nodes (7): author, description, name, provides_commands, provides_skills, provides_tools, version

### Community 63 - "[1.1.0] - 2026-10-31"
Cohesion: 0.29
Nodes (6): [1.0.0] - 2026-10-30, [1.1.0] - 2026-10-31, Added, Changed, Changelog, Initial Release

### Community 64 - "next"
Cohesion: 0.29
Nodes (9): LoginForm(), LoginPage(), RegisterPage(), Footer(), Header(), NAV_ITEMS, ShaktiqBrand(), ShaktiqBrandProps (+1 more)

### Community 65 - "next-auth"
Cohesion: 0.10
Nodes (23): dynamic, GET(), dynamic, GET(), dynamic, GET(), dynamic, GET() (+15 more)

### Community 66 - "shaktiq.webUrl"
Cohesion: 0.50
Nodes (4): shaktiq.webUrl, default, description, type

### Community 67 - "cli.ts"
Cohesion: 0.46
Nodes (6): auditCodeLocally(), computeReleaseStatus(), extractRoutesLocally(), formatMarkdown(), main(), printHelp()

### Community 68 - "gemini-service.ts"
Cohesion: 0.11
Nodes (22): CodeFixInput, CodeFixOutput, CodeReviewInput, CodeReviewOutput, CommitMessageInput, CommitMessageOutput, FindingAnalysisInput, generateCodeFixes() (+14 more)

### Community 69 - "faq/page.tsx"
Cohesion: 0.38
Nodes (5): FAQPage(), metadata, FAQAccordion(), FAQItem, SHAKTIQ_FAQS

### Community 72 - "start-n8n.sh"
Cohesion: 0.18
Nodes (10): EXECUTIONS_DATA_MAX_AGE, EXECUTIONS_DATA_PRUNE, GITHUB_TOKEN, INTERNAL_API_KEY, N8N_BLOCK_ENV_ACCESS_IN_NODE, N8N_DEFAULT_BINARY_DATA_MODE, N8N_PORT, N8N_WEBHOOK_TOKEN (+2 more)

### Community 73 - "services"
Cohesion: 0.10
Nodes (19): mountPath, name, sizeGB, generateValue, key, sync, value, url (+11 more)

### Community 74 - "runs/routes.ts"
Cohesion: 0.28
Nodes (19): getCollections(), sendSuccess(), adminRoutes(), authRoutes(), cliRoutes(), internalRoutes(), memoryRoutes(), projectRoutes() (+11 more)

### Community 77 - "notification.ts"
Cohesion: 0.40
Nodes (4): NOTIFICATION_CHANNELS, NOTIFICATION_STATUSES, Notification, notificationDtoSchema

### Community 78 - "contributes"
Cohesion: 0.22
Nodes (9): contributes, commands, menus, views, viewsContainers, editor/context, editor/title, shaktiq-sidebar (+1 more)

### Community 86 - "shared/src/index.ts"
Cohesion: 0.13
Nodes (16): ApiTokenDoc, EventDoc, FindingDoc, NotificationDoc, ProjectDoc, RunDoc, SpecSnapshotDoc, UserDoc (+8 more)

### Community 87 - "auth/routes.ts"
Cohesion: 0.14
Nodes (15): analyzeRateLimiter, authRateLimiter, cacheGet(), cacheSet(), createRateLimiter(), generalApiLimiter, getRedisClient(), MemoryCacheRecord (+7 more)

### Community 88 - "lib/auth.ts"
Cohesion: 0.22
Nodes (7): POST(), hashPassword(), SCRYPT_OPTIONS, verifyPassword(), checkRateLimit(), getWebRedis(), memoryStore

### Community 89 - "background-runner.ts"
Cohesion: 0.36
Nodes (10): buildPrCommentMarkdown(), CachedToken, fetchRepositorySpec(), generateAppJwt(), getInstallationAccessToken(), getNormalizedPrivateKey(), postCommitStatus(), postPullRequestComment() (+2 more)

### Community 90 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 91 - "start-local-mongo.ts"
Cohesion: 0.50
Nodes (4): createIndexes(), migrate(), mongodb-memory-server, start()

### Community 92 - "ai-query.ts"
Cohesion: 0.50
Nodes (3): AiQueryRequest, aiQueryRequestSchema, aiQueryResponseSchema

## Knowledge Gaps
- **36 isolated node(s):** `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `../../tsconfig.base.json`, `../../tsconfig.base.json`, `../../tsconfig.base.json` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 537 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `next`, `MarketingLayout`, `web/package.json`, `faq/page.tsx`, `next-auth`, `app/page.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **What connects `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `../../tsconfig.base.json` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `extension.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09359605911330049 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `next-auth`, `MarketingLayout`, `web/package.json`, `faq/page.tsx`, `react`, `next-auth`, `lib/auth.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `MarketingLayout` be split into smaller, more focused modules?**
  _Cohesion score 0.11384615384615385 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `react` to `next`, `MarketingLayout`, `web/package.json`, `faq/page.tsx`, `next-auth`, `app/page.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.053061224489795916 - nodes in this community are weakly interconnected._