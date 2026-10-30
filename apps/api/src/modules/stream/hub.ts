import { ChangeStream, Db } from 'mongodb';
import { SseEventType, SseMessage } from '@shaktiq/shared';
import { EventDoc, RunDoc } from '../../db/collections.js';
import { logger } from '../../lib/logger.js';

export type SseListener = (msg: SseMessage) => void;

interface Subscriber {
  id: string;
  userId: string;
  role: 'user' | 'admin';
  projectId?: string;
  listener: SseListener;
}

class ChangeStreamHub {
  private subscribers = new Map<string, Subscriber>();
  private runsStream: ChangeStream | null = null;
  private eventsStream: ChangeStream | null = null;
  private isRunning = false;

  public subscribe(sub: Subscriber): () => void {
    this.subscribers.set(sub.id, sub);
    return () => {
      this.subscribers.delete(sub.id);
    };
  }

  public publish(msg: SseMessage): void {
    for (const sub of this.subscribers.values()) {
      // Admin sees everything
      if (sub.role === 'admin') {
        sub.listener(msg);
        continue;
      }
      // If user specified projectId, filter by it
      if (sub.projectId) {
        if (msg.projectId === sub.projectId) {
          sub.listener(msg);
        }
      } else {
        // Broadcast user's visible messages
        sub.listener(msg);
      }
    }
  }

  public async start(db: Db): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      this.initRunsStream(db);
      this.initEventsStream(db);
      logger.info('ChangeStreamHub started successfully');
    } catch (err) {
      logger.warn({ err }, 'Failed to initialize MongoDB Change Streams (requires replica set)');
    }
  }

  private initRunsStream(db: Db) {
    try {
      this.runsStream = db.collection<RunDoc>('runs').watch(
        [{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }],
        { fullDocument: 'updateLookup' },
      );

      this.runsStream.on('change', (change: any) => {
        const fullDoc = change.fullDocument;
        if (!fullDoc) return;

        const msg: SseMessage = {
          type: 'run.updated',
          projectId: fullDoc.projectId?.toString(),
          data: {
            id: fullDoc._id.toString(),
            projectId: fullDoc.projectId?.toString(),
            status: fullDoc.status,
            currentVersion: fullDoc.currentVersion,
            summary: fullDoc.summary,
            completedAt: fullDoc.completedAt ? new Date(fullDoc.completedAt).toISOString() : null,
          },
          timestamp: new Date().toISOString(),
        };
        this.publish(msg);
      });

      this.runsStream.on('error', (err) => {
        logger.warn({ err }, 'Runs change stream error, reconnecting in 5s...');
        setTimeout(() => {
          if (this.isRunning) this.initRunsStream(db);
        }, 5000);
      });
    } catch (err) {
      logger.warn({ err }, 'Error watching runs collection');
    }
  }

  private initEventsStream(db: Db) {
    try {
      this.eventsStream = db.collection<EventDoc>('events').watch(
        [
          {
            $match: {
              $or: [
                { operationType: 'insert' },
                { operationType: 'update', 'updateDescription.updatedFields.duplicateCount': { $exists: true } },
              ],
            },
          },
        ],
        { fullDocument: 'updateLookup' },
      );

      this.eventsStream.on('change', (change: any) => {
        const fullDoc = change.fullDocument;
        if (!fullDoc) return;

        const isDuplicate = change.operationType === 'update' || (fullDoc.duplicateCount && fullDoc.duplicateCount > 0);
        const type: SseEventType = isDuplicate ? 'event.duplicate' : 'event.received';

        const msg: SseMessage = {
          type,
          projectId: fullDoc.projectId?.toString(),
          data: {
            eventId: fullDoc.eventId,
            projectId: fullDoc.projectId?.toString(),
            duplicateCount: fullDoc.duplicateCount,
            processingStatus: fullDoc.processingStatus,
          },
          timestamp: new Date().toISOString(),
        };
        this.publish(msg);
      });

      this.eventsStream.on('error', (err) => {
        logger.warn({ err }, 'Events change stream error, reconnecting in 5s...');
        setTimeout(() => {
          if (this.isRunning) this.initEventsStream(db);
        }, 5000);
      });
    } catch (err) {
      logger.warn({ err }, 'Error watching events collection');
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.runsStream) {
      this.runsStream.close().catch(() => {});
      this.runsStream = null;
    }
    if (this.eventsStream) {
      this.eventsStream.close().catch(() => {});
      this.eventsStream = null;
    }
    this.subscribers.clear();
  }
}

export const hub = new ChangeStreamHub();
