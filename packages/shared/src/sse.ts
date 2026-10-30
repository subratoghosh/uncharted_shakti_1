export const SSE_EVENT_TYPES = [
  'run.updated',
  'event.received',
  'event.duplicate',
  'heartbeat',
] as const;

export type SseEventType = (typeof SSE_EVENT_TYPES)[number];

export interface SseMessage<T = unknown> {
  type: SseEventType;
  projectId?: string;
  data: T;
  timestamp: string;
}
