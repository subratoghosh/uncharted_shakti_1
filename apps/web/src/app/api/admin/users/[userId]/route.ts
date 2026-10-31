import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params;
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { ok: false, error: { code: 'BAD_REQUEST', message: 'Invalid user ID format' } },
        { status: 400 }
      );
    }

    let body: { disabled?: boolean; role?: 'user' | 'admin' } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: { code: 'BAD_REQUEST', message: 'Invalid request body' } },
        { status: 400 }
      );
    }

    const { disabled, role } = body;
    const db = await getDb();
    const users = db.collection('users');

    const targetUser = await users.findOne({ _id: new ObjectId(userId) });
    if (!targetUser) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Protection for root administrator
    if (targetUser.email === 'admin@shaktiq.dev') {
      if (disabled === true || role === 'user') {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Root system admin cannot be suspended or demoted.',
            },
          },
          { status: 400 }
        );
      }
    }

    // Protection against self-suspension or self-demotion
    if (session.user.id === userId) {
      if (disabled === true || role === 'user') {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You cannot suspend or remove administrator privileges from your own account.',
            },
          },
          { status: 400 }
        );
      }
    }

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (typeof disabled === 'boolean') {
      updateFields.disabled = disabled;
    }
    if (role === 'user' || role === 'admin') {
      updateFields.role = role;
    }

    await users.updateOne({ _id: new ObjectId(userId) }, { $set: updateFields });

    const updated = await users.findOne({ _id: new ObjectId(userId) });

    return NextResponse.json({
      ok: true,
      data: {
        id: updated!._id.toHexString(),
        name: updated!.name || updated!.email.split('@')[0],
        email: updated!.email,
        role: updated!.role || 'user',
        disabled: !!updated!.disabled,
        createdAt:
          updated!.createdAt instanceof Date
            ? updated!.createdAt.toISOString()
            : String(updated!.createdAt),
        updatedAt:
          updated!.updatedAt instanceof Date
            ? updated!.updatedAt.toISOString()
            : String(updated!.updatedAt),
      },
    });
  } catch (err: unknown) {
    console.error('[Admin User Update Error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to update user';
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message } },
      { status: 500 }
    );
  }
}
