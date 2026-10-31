import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';
import { checkRateLimit } from '../../../../lib/ratelimit';
import { hashPassword } from '../../../../lib/password';

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const clientIp = forwardedFor.split(',')[0].trim();

    // Rate limit: 10 register attempts per minute per IP via Upstash Redis / memory fallback
    const rl = await checkRateLimit(clientIp, 10, 60, 'rl:register');
    if (!rl.success) {
      return NextResponse.json(
        { ok: false, error: 'Too many registration attempts. Please wait a minute and try again.', message: 'Too many registration attempts. Please wait a minute and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    let body: { name?: string; email?: string; password?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON request payload', message: 'Invalid JSON request payload' },
        { status: 400 },
      );
    }
    const { name, email, password } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Please enter your full name', message: 'Please enter your full name' },
        { status: 400 },
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address', message: 'Please enter a valid email address' },
        { status: 400 },
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Password must be at least 8 characters long',
          message: 'Password must be at least 8 characters long',
        },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();
    const users = db.collection('users');

    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: 'An account with this email address already exists',
          message: 'An account with this email address already exists',
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const now = new Date();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@shaktiq.dev').toLowerCase().trim();
    const role: 'user' | 'admin' = normalizedEmail === adminEmail ? 'admin' : 'user';

    const newUser = {
      _id: new ObjectId(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      disabled: false,
      authProvider: 'credentials',
      emailVerified: false,
      status: 'active',
      preferences: {
        theme: 'light',
        emailNotifications: true,
      },
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    };

    await users.insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        ok: true,
        message: 'Account created successfully. You can now sign in.',
        user: {
          id: newUser._id.toHexString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error('[Register API Error]:', err);
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json(
      {
        success: false,
        ok: false,
        error: message,
        message,
      },
      { status: 500 },
    );
  }
}
