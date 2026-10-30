'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { formatDate } from '../../../../lib/format';
import { Webhook, Copy, AlertTriangle, CheckCircle } from 'lucide-react';

type WebhookEvent = {
  id: string;
  eventId: string;
  eventType: string;
  source: string;
  processingStatus: 'received' | 'dispatched' | 'processed' | 'failed' | 'rejected';
  duplicateCount: number;
  lastDuplicateAt?: string | null;
  runId?: string | null;
  receivedAt: string;
};

export default function AdminEventsPage() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => apiClient<WebhookEvent[]>('/admin/events'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events & Webhook Telemetry</h1>
        <p className="text-sm text-muted">
          Intake log tracking deliveries, duplicate idempotency deduplication, and rejected
          signatures
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Webhook className="w-4 h-4 text-accent" />
            <span>Delivery Events ({events.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Delivery / Event ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Source</th>
                <th className="p-3 text-center">Duplicates</th>
                <th className="p-3">Associated Run</th>
                <th className="p-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No webhook events recorded yet. Send a webhook using scripts/replay-webhook.sh
                    to observe.
                  </td>
                </tr>
              ) : (
                events.map(ev => {
                  const isRejected = ev.processingStatus === 'rejected';
                  const isDuplicate = ev.duplicateCount > 0;

                  return (
                    <tr
                      key={ev.id}
                      className={`hover:bg-surface-2 transition-colors ${
                        isRejected ? 'bg-sev-breaking/5' : isDuplicate ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="p-3 font-mono text-[11px] max-w-xs truncate text-text font-medium">
                        {ev.eventId}
                      </td>
                      <td className="p-3">
                        {isRejected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sev-breaking/10 text-sev-breaking border border-sev-breaking/30 uppercase">
                            <AlertTriangle className="w-3 h-3" />
                            Rejected Signature
                          </span>
                        ) : ev.processingStatus === 'processed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-ok/10 text-ok border border-ok/30 uppercase">
                            <CheckCircle className="w-3 h-3" />
                            Processed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-2 text-muted border border-border uppercase">
                            {ev.processingStatus}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-muted">{ev.eventType}</td>
                      <td className="p-3 capitalize">{ev.source}</td>
                      <td className="p-3 text-center">
                        {isDuplicate ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold font-mono">
                            <Copy className="w-3 h-3" />
                            {ev.duplicateCount}
                          </span>
                        ) : (
                          <span className="text-muted font-mono">0</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-muted">
                        {ev.runId ? (
                          <span className="text-accent">{ev.runId.substring(0, 8)}...</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-muted">{formatDate(ev.receivedAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
