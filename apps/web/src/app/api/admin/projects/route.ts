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
    const projects = await db
      .collection('projects')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedProjects = projects.map((p) => ({
      id: p._id.toHexString(),
      name: p.name || 'Unnamed Project',
      fullName: p.fullName || `${p.owner || 'unknown'}/${p.repo || 'unknown'}`,
      repositoryUrl: p.repositoryUrl || '',
      defaultBranch: p.defaultBranch || 'main',
      specPath: p.specPath || 'openapi.yaml',
      ownerUserId: p.ownerUserId ? p.ownerUserId.toString() : '',
      createdAt:
        p.createdAt instanceof Date
          ? p.createdAt.toISOString()
          : typeof p.createdAt === 'string'
          ? p.createdAt
          : new Date().toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      data: formattedProjects,
    });
  } catch (err: unknown) {
    console.error('[Admin Projects Error]:', err);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message: 'Failed to retrieve projects' } },
      { status: 500 }
    );
  }
}
