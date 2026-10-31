import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getDb } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } },
        { status: 403 }
      );
    }

    const db = await getDb();
    const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray();

    const formattedUsers = users.map((u) => ({
      id: u._id.toHexString(),
      name: u.name || u.email.split('@')[0],
      email: u.email,
      role: (u.role as 'user' | 'admin') || 'user',
      disabled: !!u.disabled,
      createdAt:
        u.createdAt instanceof Date
          ? u.createdAt.toISOString()
          : typeof u.createdAt === 'string'
          ? u.createdAt
          : new Date().toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      data: formattedUsers,
    });
  } catch (err: unknown) {
    console.error('[Admin Users API Error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to retrieve users';
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message } },
      { status: 500 }
    );
  }
}
