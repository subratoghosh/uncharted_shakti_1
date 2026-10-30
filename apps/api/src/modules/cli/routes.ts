import crypto from 'node:crypto';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { AppError, ReleaseStatus, ROUTES, RunSummary } from '@shaktiq/shared';
import { getCollections } from '../../db/collections.js';
import { sha256 } from '../../lib/hash.js';
import { sendSuccess } from '../../lib/response.js';
import { authenticate, verifyProjectOwnership } from '../../plugins/auth.js';
import { compareSpecs } from '../internal/analyzer-service.js';

const cliAnalyzeSchema = z.object({
  projectId: z.string(),
  baseSpec: z.string().max(5242880, 'Spec exceeds 5 MB limit').optional().default(''),
  headSpec: z.string().max(5242880, 'Spec exceeds 5 MB limit'),
  branch: z.string().default('local'),
  previousVersion: z.string().default('HEAD'),
  currentVersion: z.string().default('working-copy'),
});

export const cliRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // POST /cli/analyze (Protected by Personal Access Token or session)
  app.post(ROUTES.CLI.ANALYZE, { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const body = cliAnalyzeSchema.parse(request.body);

    const project = await verifyProjectOwnership(body.projectId, user);
    const { runs, findings, specSnapshots, events } = getCollections();

    const eventId = `vscode:${crypto.randomUUID()}`;
    const now = new Date();

    // Store spec snapshots
    let baseSnapshotId: ObjectId | null = null;
    let baseSpecHash: string | null = null;
    if (body.baseSpec) {
      baseSpecHash = sha256(body.baseSpec);
      const existingBase = await specSnapshots.findOne({ projectId: project.id, sha256: baseSpecHash });
      if (existingBase) {
        baseSnapshotId = existingBase._id;
      } else {
        const doc = {
          _id: new ObjectId(),
          projectId: project.id,
          sha256: baseSpecHash,
          format: body.baseSpec.trim().startsWith('{') ? ('json' as const) : ('yaml' as const),
          sizeBytes: Buffer.byteLength(body.baseSpec, 'utf-8'),
          content: body.baseSpec,
          repo: project.fullName,
          path: project.specPath,
          commitSha: body.previousVersion,
          createdAt: now,
        };
        await specSnapshots.insertOne(doc);
        baseSnapshotId = doc._id;
      }
    }

    const headSpecHash = sha256(body.headSpec);
    let headSnapshotId: ObjectId | null = null;
    const existingHead = await specSnapshots.findOne({ projectId: project.id, sha256: headSpecHash });
    if (existingHead) {
      headSnapshotId = existingHead._id;
    } else {
      const doc = {
        _id: new ObjectId(),
        projectId: project.id,
        sha256: headSpecHash,
        format: body.headSpec.trim().startsWith('{') ? ('json' as const) : ('yaml' as const),
        sizeBytes: Buffer.byteLength(body.headSpec, 'utf-8'),
        content: body.headSpec,
        repo: project.fullName,
        path: project.specPath,
        commitSha: body.currentVersion,
        createdAt: now,
      };
      await specSnapshots.insertOne(doc);
      headSnapshotId = doc._id;
    }

    // Run deterministic analyzer
    const findingDrafts = await compareSpecs(body.baseSpec, body.headSpec, {
      projectId: project.id.toHexString(),
      previousVersion: body.previousVersion,
      currentVersion: body.currentVersion,
    });

    let breaking = 0;
    let warning = 0;
    let info = 0;
    for (const f of findingDrafts) {
      if (f.severity === 'breaking') breaking++;
      else if (f.severity === 'warning') warning++;
      else if (f.severity === 'info') info++;
    }

    let releaseStatus: ReleaseStatus = 'safe';
    if (breaking > 0) releaseStatus = 'blocked';
    else if (warning > 0) releaseStatus = 'review';

    const summary: RunSummary = {
      total: findingDrafts.length,
      breaking,
      warning,
      info,
      releaseStatus,
      newCount: findingDrafts.length,
      resolvedCount: 0,
      unresolvedCount: 0,
    };

    // Insert event
    await events.insertOne({
      _id: new ObjectId(),
      eventId,
      projectId: project.id,
      eventType: 'vscode.analyze',
      source: 'vscode',
      receivedAt: now,
      processingStatus: 'processed',
      duplicateCount: 0,
      lastDuplicateAt: null,
      error: null,
    });

    // Insert run as completed
    const runDoc = {
      _id: new ObjectId(),
      projectId: project.id,
      eventId,
      source: 'vscode' as const,
      previousVersion: body.previousVersion,
      currentVersion: body.currentVersion,
      commitId: null,
      branch: body.branch,
      pullRequestNumber: null,
      baseSnapshotId,
      headSnapshotId,
      baseSpecHash,
      headSpecHash,
      status: 'completed' as const,
      startedAt: now,
      completedAt: now,
      createdAt: now,
      summary,
      errorCode: null,
      errorMessage: null,
      aiStatus: 'disabled' as const,
      aiSummary: null,
    };

    await runs.insertOne(runDoc);

    // Insert findings
    if (findingDrafts.length > 0) {
      const docs = findingDrafts.map((f) => ({
        _id: new ObjectId(),
        projectId: project.id,
        runId: runDoc._id,
        fingerprint: f.fingerprint,
        previousVersion: body.previousVersion,
        currentVersion: body.currentVersion,
        endpoint: f.endpoint,
        method: f.method,
        changeType: f.changeType,
        severity: f.severity,
        ruleId: f.ruleId,
        description: f.description,
        impact: f.impact,
        recommendation: f.recommendation,
        aiExplanation: null,
        createdAt: now,
      }));

      try {
        await findings.insertMany(docs, { ordered: false });
      } catch (e) {}
    }

    return sendSuccess(
      reply,
      {
        runId: runDoc._id.toHexString(),
        summary,
        findings: findingDrafts,
      },
      202,
    );
  });
};
