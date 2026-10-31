# ShaktIQ API Backend (`apps/api`)

Fastify backend for ShaktIQ powering webhook intake, idempotency, deterministic breaking change diffing, MongoDB Atlas persistence, and Server-Sent Events (SSE).

## 🚀 Architecture Highlights

- **Framework:** Fastify 4.x with `@fastify/type-provider-zod`
- **Database:** Official Node.js `mongodb` driver (Direct access to Change Streams, Aggregations, `$jsonSchema` validators)
- **Security:**
  - Raw body buffering with timing-safe HMAC-SHA256 signature verification (`crypto.timingSafeEqual`)
  - Password hashing with Argon2id (64MB memory cost, 3 time cost, 4 parallelism)
  - HTTP-only JWT cookies (`sq_session`) for Web Dashboard
  - Personal Access Tokens (PAT, `sq_...`) hashed with SHA-256 for VS Code extension
  - Role-Based Access Control (`user` vs `admin`) with ownership checks (404 on unowned resources to prevent enumeration)
  - Zero-secret logging via Pino with field-level redaction
- **Idempotency & Race Handling:**
  - Unique index on `events.eventId` (`github:<delivery_uuid>`)
  - Replays increment `duplicateCount` atomically with 200 `{ duplicate: true, runId }`
  - Secondary unique index on `runs.eventId` prevents concurrent race conditions
- **Real-Time Updates:**
  - `ChangeStreamHub` watches `runs` and `events` collections
  - `GET /api/v1/stream` broadcasts Server-Sent Events (SSE) with heartbeat every 25s

---

## 🛠️ Scripts

```bash
# Start development server with live reload
npm run dev

# Run database migrations (creates validators, indexes, and seeds admin)
npm run db:migrate

# Typecheck TypeScript
npm run typecheck

# Build for production
npm run build

# Start production server
npm run start

# Run test suite (Vitest + MongoDB Memory Server)
npm test
```

---

## 🔑 Environment Variables

See `.env.example` in `infra/` or the root workspace.

| Variable | Type | Description |
|---|---|---|
| `NODE_ENV` | `string` | `development`, `production`, or `test` |
| `PORT` | `number` | Server listening port (default: `4000`) |
| `MONGODB_URI` | `string` | MongoDB Atlas / replica set connection string |
| `MONGODB_DB` | `string` | Database name (default: `shaktiq`) |
| `JWT_SECRET` | `string` | Secret key for JWT session cookies (min 32 chars) |
| `INTERNAL_API_KEY` | `string` | Secret key for n8n internal endpoints (min 32 chars) |
| `GITHUB_WEBHOOK_SECRET` | `string` | Shared secret for GitHub HMAC verification |
| `WEB_ORIGIN` | `string` | Frontend origin for CORS (e.g. `http://localhost:3000`) |
| `N8N_WEBHOOK_URL` | `string` | n8n webhook URL for dispatching runs |
| `N8N_WEBHOOK_TOKEN` | `string` | Header token for n8n webhook authentication |
| `ADMIN_EMAIL` | `string` | Initial admin account email for `db:migrate` |
| `ADMIN_PASSWORD` | `string` | Initial admin account password for `db:migrate` |
| `AI_EXPLANATIONS_ENABLED` | `boolean` | Enable optional Claude explanations |
