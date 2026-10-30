'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonRows } from '@/components/shared/SkeletonRow';
import { formatDate } from '@/lib/format';
import type { Event, ProcessingStatus } from '@shaktiq/shared';

const STATUS_MAP: Record<ProcessingStatus, { label: string; cls: string }> = {
  received: { label: 'Received', cls: 'text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)]' },
  dispatched: { label: 'Dispatched', cls: 'text-[var(--accent)] bg-[rgba(107,140,255,0.1)] border border-[rgba(107,140,255,0.3)]' },
  processed: { label: 'Processed', cls: 'text-[var(--ok)] ok-bg' },
  failed: { label: 'Failed', cls: 'text-[var(--sev-breaking)] sev-breaking-bg' },
  rejected: { label: 'Rejected', cls: 'text-[var(--sev-breaking)] sev-breaking-bg font-semibold' },
};

export default function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-events', page],
    queryFn: () => apiClient.admin.events({ page, limit }),
  });

  const events: Event[] = data?.ok && Array.isArray(data.data) ? data.data : [];
  const total = data?.ok && data.meta ? data.meta.total : events.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-semibold text-[var(--text)]">Events Log</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Intake webhook event audit trail, duplicate detection, and rejected payload monitoring
        </p>
      </div>

      {error ? (
        <ErrorState
          code="FETCH_ERROR"
          message={error instanceof Error ? error.message : 'Failed to load events'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                <tr className="h-10 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  <th scope="col" className="px-4">Event ID</th>
                  <th scope="col" className="px-4">Type</th>
                  <th scope="col" className="px-4">Source</th>
                  <th scope="col" className="px-4">Status</th>
                  <th scope="col" className="px-4">Project</th>
                  <th scope="col" className="px-4">Received</th>
                  <th scope="col" className="px-4 text-right">Attributes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-sm">
                {isLoading ? (
                  <SkeletonRows cols={7} rows={6} />
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <EmptyState
                        title="No events found"
                        description="No webhook or trigger events have been received yet."
                      />
                    </td>
                  </tr>
                ) : (
                  events.map((evt) => {
                    const statusInfo = STATUS_MAP[evt.processingStatus] ?? STATUS_MAP.received;
                    return (
                      <tr key={evt.id} className="h-10 hover:bg-[var(--surface-2)] transition-colors">
                        <td className="px-4 font-mono text-xs whitespace-nowrap" title={evt.eventId}>
                          {evt.eventId.length > 28 ? `${evt.eventId.slice(0, 28)}…` : evt.eventId}
                        </td>
                        <td className="px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {evt.eventType}
                        </td>
                        <td className="px-4 whitespace-nowrap">
                          <SourceBadge source={evt.source} />
                        </td>
                        <td className="px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded text-xs px-2 py-0.5 ${statusInfo.cls}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {evt.projectId ?? '—'}
                        </td>
                        <td className="px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {formatDate(evt.receivedAt)}
                        </td>
                        <td className="px-4 text-right whitespace-nowrap space-x-1">
                          {evt.duplicateCount > 0 && (
                            <span
                              className="inline-flex items-center rounded text-xs font-semibold px-2 py-0.5 text-[var(--sev-warning)] sev-warning-bg"
                              title={`${evt.duplicateCount} duplicate deliveries rejected`}
                            >
                              ×{evt.duplicateCount}
                            </span>
                          )}
                          {evt.processingStatus === 'rejected' && (
                            <span
                              className="inline-flex items-center rounded text-xs font-semibold px-2 py-0.5 text-[var(--sev-breaking)] sev-breaking-bg"
                              title={evt.error ?? 'Rejected signature'}
                            >
                              Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {total > limit && (
            <div className="border-t border-[var(--border)] p-4">
              <Pagination
                page={page}
                limit={limit}
                total={total}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
