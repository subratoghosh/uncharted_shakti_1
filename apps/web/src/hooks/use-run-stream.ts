'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { SseMessage } from '@shaktiq/shared';

type Options = {
  projectId?: string;
  onMessage: (msg: SseMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  enabled?: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const RECONNECT_BASE_MS = 2_000;
const RECONNECT_MAX_MS = 30_000;
const HEARTBEAT_TIMEOUT_MS = 40_000; // 25s heartbeat + buffer

/**
 * useRunStream — SSE hook for live run status updates.
 * - Cookie auth (credentials: 'include' baked into EventSource polyfill via fetch)
 * - Exponential backoff reconnect
 * - Calls onMessage on every SSE event
 * - Signals connected/disconnected state via callbacks
 */
export function useRunStream({
  projectId,
  onMessage,
  onConnected,
  onDisconnected,
  enabled = true,
}: Options) {
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);

  const resetHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setTimeout(() => {
      // No heartbeat received — reconnect
      esRef.current?.close();
      onDisconnected?.();
      scheduleReconnect();
    }, HEARTBEAT_TIMEOUT_MS);
  }, [onDisconnected]);

  const connect = useCallback(() => {
    if (!mountedRef.current || !enabled) return;

    const url = new URL(`${API_URL}/api/v1/stream`);
    if (projectId) url.searchParams.set('projectId', projectId);

    // EventSource always sends cookies for same-origin; cross-origin needs withCredentials
    const es = new EventSource(url.toString(), { withCredentials: true });
    esRef.current = es;

    es.onopen = () => {
      attemptRef.current = 0;
      onConnected?.();
      resetHeartbeat();
    };

    es.addEventListener('run.updated', (e) => {
      resetHeartbeat();
      try {
        const data = JSON.parse(e.data) as SseMessage;
        onMessage(data);
      } catch {
        /* ignore malformed */
      }
    });

    es.addEventListener('event.received', (e) => {
      resetHeartbeat();
      try {
        const data = JSON.parse(e.data) as SseMessage;
        onMessage(data);
      } catch {
        /* ignore malformed */
      }
    });

    es.addEventListener('event.duplicate', (e) => {
      resetHeartbeat();
      try {
        const data = JSON.parse(e.data) as SseMessage;
        onMessage(data);
      } catch {
        /* ignore malformed */
      }
    });

    // Heartbeat comment — EventSource fires 'message' for unnamed events
    es.onmessage = () => resetHeartbeat();

    es.onerror = () => {
      es.close();
      onDisconnected?.();
      if (mountedRef.current) scheduleReconnect();
    };
  }, [enabled, projectId, onMessage, onConnected, onDisconnected, resetHeartbeat]);

  function scheduleReconnect() {
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** attemptRef.current,
      RECONNECT_MAX_MS,
    );
    attemptRef.current++;
    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current) connect();
    }, delay);
  }

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) connect();
    return () => {
      mountedRef.current = false;
      esRef.current?.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    };
  }, [enabled, connect]);
}

