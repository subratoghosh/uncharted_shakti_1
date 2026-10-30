'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

type FindingFilters = {
  severity?: string;
  method?: string;
  q?: string;
};

export function useFindings(runId: string, filters?: FindingFilters) {
  return useQuery({
    queryKey: ['findings', runId, filters],
    queryFn: () => apiClient.runs.findings(runId, filters),
    enabled: Boolean(runId),
  });
}
