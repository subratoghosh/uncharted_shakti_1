'use client';

import { useState, useCallback } from 'react';
import { useRunStream } from './use-run-stream';
import type { SseMessage } from '@shaktiq/shared';

/** Exposes connection state to the topbar connection dot. */
export function useConnectionStatus(projectId?: string) {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const onMessage = useCallback((_msg: SseMessage) => {
    // ignore — callers use useRunStream directly for data
  }, []);

  const onConnected = useCallback(() => {
    setConnected(true);
    setReconnecting(false);
  }, []);

  const onDisconnected = useCallback(() => {
    setConnected(false);
    setReconnecting(true);
  }, []);

  useRunStream({ projectId, onMessage, onConnected, onDisconnected });

  return { connected, reconnecting };
}

