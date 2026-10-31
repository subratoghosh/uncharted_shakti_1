import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getDb } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } },
        { status: 403 }
      );
    }

    const db = await getDb();
    const events = await db
      .collection('events')
      .find({})
      .sort({ receivedAt: -1 })
      .limit(100)
      .toArray();

    const formattedEvents = events.map((e) => ({
      id: e._id.toHexString(),
      eventId: e.eventId || e._id.toHexString(),
      eventType: e.eventType || 'webhook',
      source: e.source || 'github',
      processingStatus: e.processingStatus || 'processed',
      duplicateCount: e.duplicateCount || 0,
      lastDuplicateAt:
        e.lastDuplicateAt instanceof Date
          ? e.lastDuplicateAt.toISOString()
          : typeof e.lastDuplicateAt === 'string'
          ? e.lastDuplicateAt
          : null,
      runId: e.runId ? e.runId.toString() : null,
      receivedAt:
        e.receivedAt instanceof Date
          ? e.receivedAt.toISOString()
          : typeof e.receivedAt === 'string'
          ? e.receivedAt
          : e.createdAt instanceof Date
          ? e.createdAt.toISOString()
          : new Date().toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      data: formattedEvents,
    });
  } catch (err: unknown) {
    console.error('[Admin Events Error]:', err);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message: 'Failed to retrieve events' } },
      { status: 500 }
    );
  }
}
