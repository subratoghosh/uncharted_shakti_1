import type { FindingDraft } from '@shaktiq/shared';

export type AnalyzerContext = {
  projectId: string;
  previousVersion: string;
  currentVersion: string;
};

export async function compareSpecs(
  _baseSpec: string,
  _headSpec: string,
  _ctx: AnalyzerContext,
): Promise<FindingDraft[]> {
  return [];
}
