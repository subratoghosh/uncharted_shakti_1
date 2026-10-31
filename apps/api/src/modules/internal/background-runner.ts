import { ObjectId } from 'mongodb';
import { ReleaseStatus, RunSummary } from '@shaktiq/shared';
import { env } from '../../config/env.js';
import { getCollections } from '../../db/collections.js';
import { logger } from '../../lib/logger.js';
import { generateMultiLayerDossier } from '../ai/gemini-service.js';
import {
  buildPrCommentMarkdown,
  fetchRepositorySpec,
  postCommitStatus,
  postPullRequestComment,
} from '../github/github-app-service.js';
import { compareSpecs } from './analyzer-service.js';

export async function processRunAutonomously(runId: ObjectId, project: any): Promise<void> {
  const { runs, projects, specSnapshots, findings } = getCollections();
  const run = await runs.findOne({ _id: runId });
  if (!run) {
    logger.error({ runId }, 'processRunAutonomously: Run not found');
    return;
  }

  const repoFullName = project.fullName;
  const installationId = project.installationId || null;
  const currentSha = run.commitId || run.currentVersion;

  logger.info({ runId, repoFullName, branch: run.branch }, 'Starting autonomous shaktIQ analysis for run');

  // 1. Set run status to running
  await runs.updateOne(
    { _id: run._id },
    { $set: { status: 'running', startedAt: new Date() } },
  );

  // 2. Post GitHub Commit Status "pending"
  if (currentSha && currentSha !== 'HEAD') {
    await postCommitStatus(
      repoFullName,
      currentSha,
      {
        state: 'pending',
        description: 'shaktIQ is analyzing OpenAPI breaking changes...',
        targetUrl: `${env.WEB_ORIGIN}/runs/${run._id.toHexString()}`,
      },
      installationId,
    );
  }

  try {
    // 3. Fetch base and head specs from GitHub
    let baseContent = '';
    let headContent = '';

    const headRef = run.currentVersion || run.branch || 'main';
    const baseRef = run.previousVersion || (run.pullRequestNumber ? 'main' : 'HEAD~1');

    logger.info({ repoFullName, headRef, baseRef }, 'Fetching OpenAPI specs from repository');

    const [headFetched, baseFetched] = await Promise.all([
      fetchRepositorySpec(repoFullName, project.specPath, headRef, installationId),
      fetchRepositorySpec(repoFullName, project.specPath, baseRef, installationId),
    ]);

    if (headFetched) {
      headContent = headFetched.content;
      if (headFetched.path !== project.specPath) {
        // Auto-update discovered spec path
        await projects.updateOne({ _id: project._id }, { $set: { specPath: headFetched.path } });
      }
    }

    if (baseFetched) {
      baseContent = baseFetched.content;
    }

    // Fallback if repository has no openapi.yaml committed yet
    if (!headContent.trim()) {
      logger.warn({ repoFullName }, 'No OpenAPI spec found in repository; completing with informational note');
      headContent = `openapi: 3.0.0\ninfo:\n  title: ${project.name}\n  version: 1.0.0\npaths: {}\n`;
    }
    if (!baseContent.trim()) {
      baseContent = headContent;
    }

    // 4. Compare specs
    const findingDrafts = await compareSpecs(baseContent, headContent, {
      projectId: project._id.toHexString(),
      previousVersion: run.previousVersion,
      currentVersion: run.currentVersion,
    });

    // 5. Generate Gemini AI Multi-Layer Dossier if enabled
    let dossier: any = null;
    let aiStatus: 'completed' | 'failed' | 'disabled' = 'disabled';

    if (env.AI_EXPLANATIONS_ENABLED && findingDrafts.length > 0) {
      try {
        const aiInputs = findingDrafts.map(f => ({
          endpoint: f.endpoint,
          method: f.method,
          changeType: f.changeType,
          severity: f.severity,
          description: f.description,
          impact: f.impact,
          recommendation: f.recommendation,
        }));

        dossier = await generateMultiLayerDossier(
          project.name,
          run.currentVersion,
          aiInputs,
          findingDrafts.filter(f => f.severity === 'breaking').length,
        );
        aiStatus = 'completed';
      } catch (aiErr) {
        logger.warn({ aiErr }, 'Gemini AI generation failed, proceeding with deterministic analysis');
        aiStatus = 'failed';
      }
    }

    // 6. Persist findings to database
    const now = new Date();
    if (findingDrafts.length > 0) {
      const docsToInsert = findingDrafts.map((f, idx) => {
        const insight = dossier?.findingInsights?.[idx];
        return {
          _id: new ObjectId(),
          projectId: project._id,
          runId: run._id,
          fingerprint: f.fingerprint,
          previousVersion: run.previousVersion,
          currentVersion: run.currentVersion,
          endpoint: f.endpoint,
          method: f.method,
          changeType: f.changeType,
          severity: f.severity,
          ruleId: f.ruleId,
          description: f.description,
          impact: insight?.consumerImpact || f.impact,
          recommendation: insight?.mitigationStrategy || f.recommendation,
          aiExplanation: insight
            ? JSON.stringify({
                explanation: insight.consumerImpact,
                codeFixSnippet: insight.codeFixSnippet,
                suggestedMitigation: insight.mitigationStrategy,
              })
            : null,
          createdAt: now,
        };
      });

      try {
        await findings.insertMany(docsToInsert as any, { ordered: false });
      } catch (insertErr: any) {
        if (insertErr.code !== 11000 && !insertErr.writeErrors) {
          throw insertErr;
        }
      }
    }

    // 7. Calculate summary metrics
    let breaking = 0;
    let warning = 0;
    let info = 0;

    for (const f of findingDrafts) {
      if (f.severity === 'breaking') breaking++;
      else if (f.severity === 'warning') warning++;
      else if (f.severity === 'info') info++;
    }

    const total = findingDrafts.length;
    let releaseStatus: ReleaseStatus = 'safe';
    if (breaking > 0) releaseStatus = 'blocked';
    else if (warning > 0) releaseStatus = 'review';

    const summary: RunSummary = {
      total,
      breaking,
      warning,
      info,
      releaseStatus,
      newCount: total,
      unresolvedCount: 0,
      resolvedCount: 0,
    };

    // 8. Update run to completed
    await runs.updateOne(
      { _id: run._id },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          summary,
          aiStatus,
          aiSummary: dossier
            ? JSON.stringify({
                verdictLabel: dossier.verdictLabel,
                verdictDescription: dossier.verdictDescription,
                releaseScore: dossier.releaseScore,
                blastRadius: dossier.blastRadius,
                actionPlan: dossier.executiveActionPlan,
              })
            : null,
        },
      },
    );

    logger.info(
      { runId, releaseStatus, breaking, warning },
      'Autonomous shaktIQ analysis successfully completed',
    );

    // 9. Post final GitHub Commit Status (green or red)
    if (currentSha && currentSha !== 'HEAD') {
      const statusState = releaseStatus === 'blocked' ? 'failure' : 'success';
      const statusDesc =
        releaseStatus === 'blocked'
          ? `Blocked: ${breaking} breaking API change(s) detected`
          : releaseStatus === 'review'
            ? `Review: ${warning} API warning(s) detected`
            : 'Safe: All API changes backward-compatible';

      await postCommitStatus(
        repoFullName,
        currentSha,
        {
          state: statusState,
          description: statusDesc,
          targetUrl: `${env.WEB_ORIGIN}/runs/${run._id.toHexString()}`,
        },
        installationId,
      );
    }

    // 10. Post GitHub PR review comment if run was triggered by a pull request
    if (run.pullRequestNumber) {
      const commentMarkdown = buildPrCommentMarkdown({
        repoFullName,
        runId: run._id.toHexString(),
        verdict: releaseStatus,
        releaseScore: dossier?.releaseScore ?? (releaseStatus === 'safe' ? 100 : releaseStatus === 'review' ? 75 : 40),
        breakingCount: breaking,
        warningCount: warning,
        infoCount: info,
        dossier,
        findings: findingDrafts,
      });

      await postPullRequestComment(
        repoFullName,
        run.pullRequestNumber,
        commentMarkdown,
        installationId,
      );
    }
  } catch (err: any) {
    logger.error({ err, runId }, 'Error running autonomous shaktIQ analysis');

    await runs.updateOne(
      { _id: run._id },
      {
        $set: {
          status: 'failed',
          errorCode: 'ANALYSIS_FAILED',
          errorMessage: err.message || 'Analysis encountered an unhandled exception',
          completedAt: new Date(),
        },
      },
    );

    if (currentSha && currentSha !== 'HEAD') {
      await postCommitStatus(
        repoFullName,
        currentSha,
        {
          state: 'error',
          description: 'shaktIQ analysis failed',
          targetUrl: `${env.WEB_ORIGIN}/runs/${run._id.toHexString()}`,
        },
        installationId,
      );
    }
  }
}
