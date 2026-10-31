import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';
import { checkRateLimit } from '../../../../lib/ratelimit';

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const clientIp = forwardedFor.split(',')[0].trim();

    // Rate limit: 10 register attempts per minute per IP via Upstash Redis / memory fallback
    const rl = await checkRateLimit(clientIp, 10, 60, 'rl:register');
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait a minute and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter your full name' },
        { status: 400 },
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 },
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();
    const users = db.collection('users');

    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const now = new Date();
    const newUser = {
      _id: new ObjectId(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user' as const,
      disabled: false,
      createdAt: now,
      updatedAt: now,
    };

    await users.insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. You can now sign in.',
        user: {
          id: newUser._id.toHexString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
