'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useRuns(projectId: string) {
  return useQuery({
    queryKey: ['runs', projectId],
    queryFn: () => apiClient.runs.listForProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useRun(runId: string) {
  return useQuery({
    queryKey: ['run', runId],
    queryFn: () => apiClient.runs.get(runId),
    enabled: Boolean(runId),
  });
}
