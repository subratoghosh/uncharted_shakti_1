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
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      projectsCount,
      runsTotal,
      runsLast24h,
      runsByStatusAgg,
      eventsTotal,
      rejectedCount,
      usersCount,
    ] = await Promise.all([
      db.collection('projects').countDocuments(),
      db.collection('runs').countDocuments(),
      db.collection('runs').countDocuments({ createdAt: { $gte: oneDayAgo } }),
      db
        .collection('runs')
        .aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      db.collection('events').countDocuments(),
      db.collection('events').countDocuments({ processingStatus: 'rejected' }),
      db.collection('users').countDocuments(),
    ]);

    const runsByStatus: Record<string, number> = {};
    for (const item of runsByStatusAgg) {
      if (item._id) {
        runsByStatus[item._id] = item.count;
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        projectsCount,
        runsTotal,
        runsLast24h,
        runsByStatus,
        eventsTotal,
        duplicatesCount: 0,
        rejectedCount,
        usersCount,
      },
    });
  } catch (err: unknown) {
    console.error('[Admin Overview Error]:', err);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message: 'Failed to retrieve platform overview' } },
      { status: 500 }
    );
  }
}
