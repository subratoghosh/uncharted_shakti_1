# Graph Report - ShaktIQ  (2026-10-31)

## Corpus Check
- 134 files · ~49,078 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 5, .example 2, .api 1)

## Summary
- 812 nodes · 1566 edges · 58 communities (44 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c5371d80`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Web Admin Dashboard
- Web Admin Dashboard
- API Diff Analyzer Core
- Package Dependencies (Group 3)
- Infra Docker Services
- ESLint Linter Configuration
- Package Dependencies (Group 6)
- Auth & Token Models
- Package Dependencies (Group 8)
- finding.ts
- TypeScript Compiler Config
- Auth & Token Models
- Package Dependencies (Group 12)
- Auth & Token Models
- API Diff Analyzer Core
- API Environment & Clients
- Auth & Token Models
- API Diff Analyzer Core
- API Diff Analyzer Core
- System Subsystem 19
- VS Code Extension
- Run Execution & Verdicts
- Auth & Token Models
- TypeScript Compiler Config
- n8n Stub Mock API
- @fastify/cors
- System Subsystem 26
- System Subsystem 27
- TypeScript Compiler Config
- TypeScript Compiler Config
- TypeScript Compiler Config
- TypeScript Compiler Config
- Database Migrations & Schemas
- hub.ts
- VS Code Extension
- TypeScript Compiler Config
- Package Dependencies (Group 36)
- collections.ts
- System Subsystem 38
- Auth & Token Models
- System Subsystem 40
- System Subsystem 41
- System Subsystem 42
- Run Execution & Verdicts
- System Subsystem 44
- lib/auth.ts
- next-auth.d.ts
- pino
- @shaktiq/shared@*
- System Subsystem 52
- Architecture & Specifications
- Architecture & Specifications
- Architecture & Specifications
- Architecture & Specifications
- Architecture & Specifications
- Auth & Token Models

## God Nodes (most connected - your core abstractions)
1. `apiClient()` - 28 edges
2. `react` - 27 edges
3. `mongodb` - 23 edges
4. `AppError` - 22 edges
5. `getCollections()` - 21 edges
6. `formatDate()` - 21 edges
7. `lucide-react` - 20 edges
8. `sendSuccess()` - 19 edges
9. `authenticate()` - 17 edges
10. `@tanstack/react-query` - 17 edges

## Surprising Connections (you probably didn't know these)
- `ShaktIQ Extension Brand Icon` --conceptually_related_to--> `VS Code IDE Extension`  [INFERRED]
  apps/vscode-ext/resources/icon.svg → docs/architecture.md
- `ShaktIQ Monorepo Root` --references--> `Security Model & Policies`  [EXTRACTED]
  README.md → docs/security.md
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

## Communities (58 total, 14 thin omitted)

### Community 0 - "Web Admin Dashboard"
Cohesion: 0.11
Nodes (54): Env, envSchema, parsed, closeDb(), connectDb(), getDb(), getCollections(), createIndexes() (+46 more)

### Community 1 - "Web Admin Dashboard"
Cohesion: 0.07
Nodes (58): AdminEventsPage(), WebhookEvent, AdminOverview, AdminOverviewPage(), AdminProjectsPage(), Project, AdminRunsPage(), Run (+50 more)

### Community 2 - "API Diff Analyzer Core"
Cohesion: 0.08
Nodes (26): activate(), AnalyzeResponse, execFileAsync, FindingItem, FindingsTreeDataProvider, FindingTreeItem, execFileAsync, ExecutorOptions (+18 more)

### Community 3 - "Package Dependencies (Group 3)"
Cohesion: 0.07
Nodes (38): dependencies, clsx@^2.1.1, lucide-react@^0.408.0, next@^14.2.5, next-auth@^4.24.15, react@^18.3.1, react-dom@^18.3.1, @shaktiq/shared@* (+30 more)

### Community 4 - "Infra Docker Services"
Cohesion: 0.07
Nodes (31): build, container_name, environment, networks, ports, restart, context, dockerfile (+23 more)

### Community 5 - "ESLint Linter Configuration"
Cohesion: 0.08
Nodes (29): description, devDependencies, eslint@^8.57.0, prettier@^3.3.3, @types/node@^20.14.0, typescript@^5.7.3, @typescript-eslint/eslint-plugin@^7.18.0, @typescript-eslint/parser@^7.18.0 (+21 more)

### Community 6 - "Package Dependencies (Group 6)"
Cohesion: 0.11
Nodes (22): dependencies, fastify@^4.28.1, @shaktiq/shared@*, devDependencies, tsx@^4.16.2, @types/node@^20.14.0, typescript@^5.5.4, fastify (+14 more)

### Community 7 - "Auth & Token Models"
Cohesion: 0.12
Nodes (17): ApiToken, apiTokenDtoSchema, CreateApiTokenRequest, createApiTokenRequestSchema, CreateApiTokenResponse, createApiTokenResponseSchema, objectIdSchema, PaginationQuery (+9 more)

### Community 8 - "Package Dependencies (Group 8)"
Cohesion: 0.12
Nodes (19): dependencies, @shaktiq/shared@*, devDependencies, typescript@^5.5.4, vitest@^1.6.0, exports, @shaktiq/shared, typescript (+11 more)

### Community 9 - "finding.ts"
Cohesion: 0.20
Nodes (9): CHANGE_TYPES, DIFF_STATUSES, HTTP_METHODS, SEVERITIES, Finding, findingDraftSchema, findingDtoSchema, Hotspot (+1 more)

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

### Community 15 - "API Environment & Clients"
Cohesion: 0.13
Nodes (13): ERROR_CODES, ERROR_HTTP_STATUS_MAP, ErrorCode, ErrorDetail, ApiErrorPayload, apiErrorSchema, apiFailureEnvelopeSchema, ApiFailureResponse (+5 more)

### Community 16 - "Auth & Token Models"
Cohesion: 0.13
Nodes (20): description, devDependencies, mongodb-memory-server@^10.1.3, pino-pretty@^13.0.0, tsx@^4.19.2, @types/jsonwebtoken@^9.0.8, @types/node@^22.10.7, typescript@^5.7.3 (+12 more)

### Community 17 - "API Diff Analyzer Core"
Cohesion: 0.10
Nodes (19): NOTIFICATION_CHANNELS, NOTIFICATION_STATUSES, SPEC_SOURCES, InternalRunAnalyzeRequest, internalRunAnalyzeRequestSchema, InternalRunAnalyzeResponse, internalRunAnalyzeResponseSchema, InternalRunExplanationsRequest (+11 more)

### Community 18 - "API Diff Analyzer Core"
Cohesion: 0.11
Nodes (18): dependencies, dotenv@^16.4.7, @fastify/cookie@^9.4.0, @fastify/rate-limit@^9.1.0, fastify-raw-body@^4.3.0, fastify-type-provider-zod@^2.0.0, jsonwebtoken@^9.0.2, mongodb@^6.12.0 (+10 more)

### Community 19 - "System Subsystem 19"
Cohesion: 0.15
Nodes (13): properties, title, contributes, commands, configuration, views, viewsContainers, shaktiq.apiUrl (+5 more)

### Community 20 - "VS Code Extension"
Cohesion: 0.17
Nodes (11): activationEvents, categories, description, displayName, engines, vscode, files, main (+3 more)

### Community 21 - "Run Execution & Verdicts"
Cohesion: 0.17
Nodes (11): AI_STATUSES, RELEASE_STATUSES, RUN_STATUSES, CompareRunsQuery, compareRunsQuerySchema, computeReleaseStatus(), CreateManualRunRequest, createManualRunRequestSchema (+3 more)

### Community 22 - "Auth & Token Models"
Cohesion: 0.33
Nodes (9): VALIDATORS_MAP, apiTokenValidator, eventValidator, findingValidator, notificationValidator, projectValidator, runValidator, specSnapshotValidator (+1 more)

### Community 23 - "TypeScript Compiler Config"
Cohesion: 0.18
Nodes (10): compilerOptions, composite, module, moduleResolution, outDir, rootDir, target, extends (+2 more)

### Community 24 - "n8n Stub Mock API"
Cohesion: 0.24
Nodes (6): app, recordedCalls, StubCall, stubState, FindingDraft, RunSummary

### Community 25 - "@fastify/cors"
Cohesion: 0.33
Nodes (4): fastify@^4.28.1, @fastify/cors@^9.0.1, fastify, @fastify/cors

### Community 26 - "System Subsystem 26"
Cohesion: 0.20
Nodes (9): EVENT_TYPES, PROCESSING_STATUSES, SOURCES, Event, eventDtoSchema, EventPayloadSubset, eventPayloadSubsetSchema, WebhookDeliveryResponse (+1 more)

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
Cohesion: 0.29
Nodes (7): scripts, build, db:migrate, dev, start, test, typecheck

### Community 33 - "hub.ts"
Cohesion: 0.17
Nodes (8): EventDoc, RunDoc, ChangeStreamHub, SseListener, Subscriber, SSE_EVENT_TYPES, SseEventType, SseMessage

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
Cohesion: 0.14
Nodes (19): ApiTokenDoc, FindingDoc, NotificationDoc, ProjectDoc, SpecSnapshotDoc, UserDoc, AiStatus, DiffStatus (+11 more)

### Community 38 - "System Subsystem 38"
Cohesion: 0.50
Nodes (4): shaktiq.baseRef, default, description, type

### Community 39 - "Auth & Token Models"
Cohesion: 0.50
Nodes (4): shaktiq.specPath, default, description, type

### Community 40 - "System Subsystem 40"
Cohesion: 0.50
Nodes (4): shaktiq.webUrl, default, description, type

### Community 42 - "System Subsystem 42"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 45 - "lib/auth.ts"
Cohesion: 0.31
Nodes (6): argon2@^0.41.1, handler, POST(), authOptions, getDb(), argon2

### Community 46 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

## Knowledge Gaps
- **27 isolated node(s):** `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `../../tsconfig.base.json`, `../../tsconfig.base.json`, `../../tsconfig.base.json` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 351 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mongodb` connect `Web Admin Dashboard` to `hub.ts`, `collections.ts`, `lib/auth.ts`, `Auth & Token Models`, `API Diff Analyzer Core`, `Auth & Token Models`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `../../tsconfig.base.json` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Web Admin Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.10802469135802469 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Web Admin Dashboard` to `Package Dependencies (Group 3)`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `Web Admin Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.06642246642246642 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Web Admin Dashboard` to `Package Dependencies (Group 3)`, `lib/auth.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `API Diff Analyzer Core` be split into smaller, more focused modules?**
  _Cohesion score 0.07678075855689177 - nodes in this community are weakly interconnected._