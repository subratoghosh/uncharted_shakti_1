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
    const runs = await db
      .collection('runs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const formattedRuns = runs.map((r) => ({
      id: r._id.toHexString(),
      projectId: r.projectId ? r.projectId.toString() : '',
      source: r.source || 'manual',
      status: r.status || 'unknown',
      previousVersion: r.previousVersion || r.baseSha || 'base',
      currentVersion: r.currentVersion || r.headSha || 'head',
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : typeof r.createdAt === 'string'
          ? r.createdAt
          : new Date().toISOString(),
      summary: r.summary || {
        total: 0,
        breaking: 0,
        warning: 0,
        info: 0,
        releaseStatus: r.releaseStatus || 'SAFE',
      },
    }));

    return NextResponse.json({
      ok: true,
      data: formattedRuns,
    });
  } catch (err: unknown) {
    console.error('[Admin Runs Error]:', err);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message: 'Failed to retrieve runs' } },
      { status: 500 }
    );
  }
}
