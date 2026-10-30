'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export type SSEStatus = 'connected' | 'reconnecting' | 'disconnected';

export function useRunStream(projectId?: string) {
  const [status, setStatus] = useState<SSEStatus>('disconnected');
  const queryClient = useQueryClient();

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      setStatus('reconnecting');
      const url = `${API_BASE}/stream${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ''}`;

      try {
        es = new EventSource(url, { withCredentials: true });

        es.onopen = () => {
          setStatus('connected');
        };

        es.addEventListener('run.updated', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            // Invalidate run queries
            queryClient.invalidateQueries({ queryKey: ['runs'] });
            if (data.id) {
              queryClient.invalidateQueries({ queryKey: ['run', data.id] });
            }
          } catch (e) {
            console.error('Failed to parse SSE message', e);
          }
        });

        es.addEventListener('event.received', () => {
          queryClient.invalidateQueries({ queryKey: ['events'] });
          queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
        });

        es.addEventListener('event.duplicate', () => {
          queryClient.invalidateQueries({ queryKey: ['events'] });
          queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
        });

        es.onerror = () => {
          setStatus('reconnecting');
          es?.close();
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch {
        setStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (es) {
        es.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [projectId, queryClient]);

  return { status };
}
