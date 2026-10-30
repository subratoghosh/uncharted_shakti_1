# ShaktIQ – Database Design (MongoDB Atlas)

Database name: `shaktiq`. Driver: official `mongodb` Node driver. IDs: `_id` is ObjectId; API exposes it as string `id`. All documents carry `createdAt` (Date, UTC). Collections: `users`, `apiTokens`, `projects`, `events`, `runs`, `findings`, `specSnapshots`, `notifications`.

## 1. Relationships
```
users 1─* projects (ownerUserId)      users 1─* apiTokens
projects 1─* events 1─1 runs (runs.eventId unique)
projects 1─* runs 1─* findings
projects 1─* specSnapshots ; runs → base/head specSnapshots
runs 1─* notifications
```

## 2. Enums
- `role`: `user | admin`
- `source`: `github | manual | vscode`
- `eventType`: `github.push | github.pull_request | manual.analyze | vscode.analyze`
- `processingStatus` (events): `received | dispatched | processed | failed | rejected`
- `status` (runs): `queued | running | completed | failed`
- `severity`: `breaking | warning | info`
- `releaseStatus`: `safe | review | blocked`
- `changeType`: `ENDPOINT_REMOVED, METHOD_REMOVED, REQUIRED_REQUEST_FIELD_ADDED, REQUIRED_PARAMETER_ADDED, RESPONSE_FIELD_REMOVED, FIELD_TYPE_CHANGED, FIELD_MADE_REQUIRED, RESPONSE_SCHEMA_CHANGED, PARAMETER_CHANGED, ENDPOINT_ADDED, OPTIONAL_FIELD_ADDED, OTHER`

## 3. Collections

### 3.1 users
```json
{ "_id": "...", "email": "dev@x.com", "passwordHash": "argon2id...", "name": "Dev", "role": "user", "disabled": false, "createdAt": "..." , "updatedAt": "..." }
```
Indexes: `{email:1}` **unique** (login, no duplicate accounts).

### 3.2 apiTokens (VS Code PATs)
```json
{ "_id": "...", "userId": "...", "name": "laptop", "tokenHash": "sha256...", "prefix": "sq_ab12", "lastUsedAt": null, "revokedAt": null, "createdAt": "..." }
```
Indexes: `{tokenHash:1}` unique (auth lookup); `{userId:1, createdAt:-1}` (list tokens). Raw token shown once.

### 3.3 projects
```json
{ "_id": "...", "ownerUserId": "...", "name": "Orders API", "repositoryUrl": "https://github.com/acme/orders", "owner": "acme", "repo": "orders", "fullName": "acme/orders", "defaultBranch": "main", "specPath": "openapi.yaml", "createdAt": "...", "updatedAt": "..." }
```
Indexes: `{fullName:1}` **unique** (webhook project resolution, no duplicate registration); `{ownerUserId:1, createdAt:-1}` (user project list).

### 3.4 events
```json
{ "_id": "...", "eventId": "github:72d3162e-cc78-11e3-81ab-4c9367dc0958", "projectId": "...", "eventType": "github.push", "source": "github",
  "payload": { "ref": "refs/heads/main", "before": "abc", "after": "def", "repository": "acme/orders", "pullRequest": null },
  "receivedAt": "...", "processingStatus": "dispatched", "runId": "...", "duplicateCount": 0, "lastDuplicateAt": null, "error": null }
```
`payload` stores a **trimmed, validated subset** (never the full webhook body).
Indexes:
- `{eventId:1}` **unique** → core duplicate prevention.
- `{projectId:1, receivedAt:-1}` → admin/project event log.
- `{processingStatus:1, receivedAt:-1}` → find failed/stuck events.
- `{receivedAt:1}` TTL 30 days (`expireAfterSeconds: 2592000`) → retention.
Rejected deliveries: stored with `eventId: "rejected:<uuid>"`, `processingStatus: "rejected"`, no projectId required.

### 3.5 runs
```json
{ "_id": "...", "projectId": "...", "eventId": "github:72d3...", "source": "github",
  "previousVersion": "abc1234", "currentVersion": "def5678", "commitId": "def5678...full sha",
  "branch": "main", "pullRequestNumber": null,
  "baseSnapshotId": "...", "headSnapshotId": "...", "baseSpecHash": "sha256...", "headSpecHash": "sha256...",
  "status": "completed", "startedAt": "...", "completedAt": "...", "createdAt": "...",
  "summary": { "total": 4, "breaking": 2, "warning": 1, "info": 1, "releaseStatus": "blocked", "newCount": 2, "resolvedCount": 1, "unresolvedCount": 1 },
  "errorCode": null, "errorMessage": null, "aiStatus": "disabled", "aiSummary": null }
```
Indexes:
- `{eventId:1}` **unique** → second line of defense: one run per event even under races.
- `{projectId:1, createdAt:-1}` → run history (descending, paginated).
- `{projectId:1, status:1}` → "running/failed" filters.
- `{status:1, createdAt:-1}` → admin all-runs view.

### 3.6 findings
```json
{ "_id": "...", "projectId": "...", "runId": "...", "fingerprint": "sha256...", "previousVersion": "abc1234", "currentVersion": "def5678",
  "endpoint": "/users/{id}", "method": "DELETE", "changeType": "ENDPOINT_REMOVED", "severity": "breaking", "ruleId": "api-path-removed-without-deprecation",
  "description": "Endpoint DELETE /users/{id} was removed", "impact": "Clients calling this endpoint will receive 404/405.", "recommendation": "Restore the endpoint or deprecate first and communicate a sunset date.",
  "aiExplanation": null, "createdAt": "..." }
```
Indexes:
- `{runId:1, severity:1}` → list findings for a run, severity filter.
- `{runId:1, fingerprint:1}` **unique** → no duplicate findings in a run (also makes `analyze` retries idempotent).
- `{projectId:1, fingerprint:1, createdAt:-1}` → compare/memory by fingerprint.
- `{projectId:1, method:1, endpoint:1, createdAt:-1}` → project memory per endpoint.

### 3.7 specSnapshots
```json
{ "_id": "...", "projectId": "...", "sha256": "...", "format": "yaml", "sizeBytes": 20481, "content": "openapi: 3.0.3 ...", "repo": "acme/orders", "path": "openapi.yaml", "commitSha": "def...", "createdAt": "..." }
```
Indexes: `{projectId:1, sha256:1}` **unique** (store identical spec once). Max 5 MB enforced in app (Mongo limit 16 MB).

### 3.8 notifications
```json
{ "_id": "...", "runId": "...", "projectId": "...", "channel": "github_pr_comment", "status": "sent", "target": "acme/orders#42", "responseCode": 201, "error": null, "createdAt": "..." }
```
Indexes: `{runId:1, createdAt:-1}`; `{createdAt:1}` TTL 90 days.

## 4. Schema Validation (`db/validators/*.ts`, applied by `db/migrate.ts` via `collMod`/`createCollection`, `validationLevel: "strict"`, `validationAction: "error"`)
```js
// events
{ $jsonSchema: { bsonType: "object",
  required: ["eventId","eventType","source","receivedAt","processingStatus","duplicateCount"],
  properties: {
    eventId: { bsonType: "string", minLength: 8 },
    eventType: { enum: ["github.push","github.pull_request","manual.analyze","vscode.analyze"] },
    source: { enum: ["github","manual","vscode"] },
    projectId: { bsonType: "objectId" },
    receivedAt: { bsonType: "date" },
    processingStatus: { enum: ["received","dispatched","processed","failed","rejected"] },
    duplicateCount: { bsonType: "int", minimum: 0 } } } }

// runs
{ $jsonSchema: { bsonType: "object",
  required: ["projectId","eventId","source","status","createdAt","currentVersion"],
  properties: {
    projectId: { bsonType: "objectId" }, eventId: { bsonType: "string" },
    status: { enum: ["queued","running","completed","failed"] },
    createdAt: { bsonType: "date" }, startedAt: { bsonType: ["date","null"] }, completedAt: { bsonType: ["date","null"] },
    summary: { bsonType: ["object","null"], properties: {
      total: { bsonType: "int", minimum: 0 }, breaking: { bsonType: "int", minimum: 0 },
      warning: { bsonType: "int", minimum: 0 }, info: { bsonType: "int", minimum: 0 },
      releaseStatus: { enum: ["safe","review","blocked"] } } } } } }

// findings
{ $jsonSchema: { bsonType: "object",
  required: ["projectId","runId","fingerprint","endpoint","method","changeType","severity","description","impact","recommendation","createdAt"],
  properties: {
    fingerprint: { bsonType: "string", minLength: 64, maxLength: 64 },
    method: { enum: ["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS","TRACE","*"] },
    severity: { enum: ["breaking","warning","info"] },
    changeType: { enum: ["ENDPOINT_REMOVED","METHOD_REMOVED","REQUIRED_REQUEST_FIELD_ADDED","REQUIRED_PARAMETER_ADDED","RESPONSE_FIELD_REMOVED","FIELD_TYPE_CHANGED","FIELD_MADE_REQUIRED","RESPONSE_SCHEMA_CHANGED","PARAMETER_CHANGED","ENDPOINT_ADDED","OPTIONAL_FIELD_ADDED","OTHER"] },
    createdAt: { bsonType: "date" } } } }
```
`projects`, `users`, `specSnapshots`, `notifications`, `apiTokens` get equivalent `required` + type validators following the same pattern (required fields = those without `null` in the examples above). Important: numeric fields written by Node must be `Int32` (use `new Int32(n)`) or declare validators as `bsonType: ["int","long","double"]`; pick one convention and keep it (we use `["int","long"]`).

## 5. Aggregation Pipelines

### 5.1 Compare two runs (new / resolved / unresolved)
```js
db.findings.aggregate([
  { $match: { projectId, runId: { $in: [baseRunId, headRunId] } } },
  { $group: { _id: "$fingerprint",
      inBase: { $max: { $cond: [{ $eq: ["$runId", baseRunId] }, 1, 0] } },
      inHead: { $max: { $cond: [{ $eq: ["$runId", headRunId] }, 1, 0] } },
      doc: { $first: "$$ROOT" } } },
  { $addFields: { diffStatus: { $switch: { branches: [
      { case: { $and: [{ $eq: ["$inBase", 0] }, { $eq: ["$inHead", 1] }] }, then: "new" },
      { case: { $and: [{ $eq: ["$inBase", 1] }, { $eq: ["$inHead", 0] }] }, then: "resolved" } ],
      default: "unresolved" } } } },
  { $replaceRoot: { newRoot: { $mergeObjects: ["$doc", { diffStatus: "$diffStatus" }] } } },
  { $sort: { severity: 1, endpoint: 1 } }
])
```
Note: `doc` for resolved findings comes from the base run, for new from head. For `unresolved`, pick head doc (sort before group by `runId` desc if needed).

### 5.2 Run summary by severity
```js
db.findings.aggregate([
  { $match: { runId } },
  { $group: { _id: "$severity", count: { $sum: 1 } } }
])
```
Used by `analyze` to write `runs.summary`.

### 5.3 Run history with counts
```js
db.runs.aggregate([
  { $match: { projectId } }, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit },
  { $project: { source:1, status:1, currentVersion:1, previousVersion:1, createdAt:1, summary:1 } }
])
```

### 5.4 Project memory: endpoint hotspots
```js
db.findings.aggregate([
  { $match: { projectId, severity: { $in: ["breaking","warning"] } } },
  { $group: { _id: { method: "$method", endpoint: "$endpoint" },
      occurrences: { $sum: 1 }, runs: { $addToSet: "$runId" },
      lastSeen: { $max: "$createdAt" }, changeTypes: { $addToSet: "$changeType" } } },
  { $addFields: { distinctRuns: { $size: "$runs" } } },
  { $match: { distinctRuns: { $gte: 2 } } },
  { $sort: { distinctRuns: -1, lastSeen: -1 } }, { $limit: 10 },
  { $project: { runs: 0 } }
])
```

### 5.5 Endpoint history (for finding detail drawer)
`db.findings.find({ projectId, method, endpoint, runId: { $ne: currentRunId } }).sort({ createdAt: -1 }).limit(20)` served by the `{projectId, method, endpoint, createdAt}` index.

### 5.6 Admin overview
`$facet` over `runs` (count by status, last 24h) and `events` (sum of `duplicateCount`, count of `rejected`).

## 6. Run Summary Rule
`releaseStatus = blocked` if `breaking > 0`; else `review` if `warning > 0`; else `safe`. `newCount/resolvedCount/unresolvedCount` computed with 5.1 against the previous completed run on the same branch (first run: all zero).

## 7. Idempotency Details
- `events.insertOne` duplicate (`err.code === 11000`) → `updateOne({eventId}, {$inc:{duplicateCount:1}, $set:{lastDuplicateAt:now}})`, return existing event + `runId`.
- Run creation uses `insertOne` on `runs` with `eventId`; a duplicate-key error fetches the existing run.
- `analyze` is retry-safe: unique `{runId, fingerprint}`; insert uses `ordered:false` and ignores 11000.
- Run transitions use conditional updates: `updateOne({_id, status:"queued"}, {$set:{status:"running", startedAt}})`.

## 8. Change Streams
```ts
const runsStream = db.collection("runs").watch(
  [{ $match: { operationType: { $in: ["insert","update"] } } }],
  { fullDocument: "updateLookup" });
runsStream.on("change", c => hub.publish({ type: "run.updated", projectId: String(c.fullDocument.projectId), data: toRunDto(c.fullDocument) }));

const eventsStream = db.collection("events").watch(
  [{ $match: { $or: [{ operationType: "insert" },
      { operationType: "update", "updateDescription.updatedFields.duplicateCount": { $exists: true } }] } }],
  { fullDocument: "updateLookup" });
```
Event type mapping: events insert → `event.received`; duplicateCount update → `event.duplicate`; runs → `run.updated`. Resume tokens kept in memory only; dashboard refetches after reconnect.

## 9. Retention
`events` 30 days (TTL), `notifications` 90 days (TTL), `runs`/`findings`/`specSnapshots` kept until project deletion (project delete cascades in service layer).

## 10. Setup Script (`apps/api/src/db/migrate.ts`)
Idempotent: creates collections with validators, calls `createIndexes`, seeds admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Run with `npm run db:migrate -w apps/api`.
