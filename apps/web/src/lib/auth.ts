import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import argon2 from 'argon2';
import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    'shaktiq-nextauth-super-secret-production-and-development-key-32-chars-long!',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        const db = await getDb();
        const users = db.collection('users');

        const user = await users.findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (user.disabled) {
          throw new Error('Your account has been suspended. Please contact platform administration.');
        }

        if (!user.passwordHash) {
          throw new Error('This account was created with OAuth. Please sign in with Google or GitHub.');
        }

        const isValid = await argon2.verify(user.passwordHash, credentials.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        await users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date(), updatedAt: new Date() } });
        return {
          id: user._id.toHexString(),
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: (user.role as 'user' | 'admin') || 'user',
          disabled: !!user.disabled,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : [
          // Fallback placeholder provider so UI components render consistently
          GoogleProvider({
            clientId: 'google-client-id-placeholder',
            clientSecret: 'google-client-secret-placeholder',
          }),
        ]),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : [
          // Fallback placeholder provider so UI components render consistently
          GithubProvider({
            clientId: 'github-client-id-placeholder',
            clientSecret: 'github-client-secret-placeholder',
          }),
        ]),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (!user.email) return false;

        const db = await getDb();
        const users = db.collection('users');
        const normalizedEmail = user.email.toLowerCase().trim();

        const existing = await users.findOne({ email: normalizedEmail });

        if (existing) {
          // If the user was suspended by admin or in the DB, reject login
          if (existing.disabled) {
            return '/login?error=AccountSuspended';
          }

          user.id = existing._id.toHexString();
          user.role = existing.role || 'user';
          user.disabled = !!existing.disabled;

          // Update profile information
          await users.updateOne(
            { _id: existing._id },
            {
              $set: {
                name: user.name || existing.name,
                image: user.image || existing.image,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
              },
            },
          );
        } else {
          // New OAuth user registration
          const now = new Date();
          const insertResult = await users.insertOne({
            _id: new ObjectId(),
            email: normalizedEmail,
            name: user.name || normalizedEmail.split('@')[0],
            image: user.image || null,
            role: 'user',
            disabled: false,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
            authProvider: account.provider,
            providerAccountId: account.providerAccountId,
          });

          user.id = insertResult.insertedId.toHexString();
          user.role = 'user';
          user.disabled = false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.disabled = !!user.disabled;
      }

      // Check live database state so role changes and suspensions take effect immediately
      if (token.id && ObjectId.isValid(token.id)) {
        try {
          const db = await getDb();
          const userDoc = await db.collection('users').findOne({ _id: new ObjectId(token.id) });
          if (userDoc) {
            token.role = userDoc.role || 'user';
            token.disabled = !!userDoc.disabled;
          } else {
            token.disabled = true;
          }
        } catch {
          // Keep existing token claims if DB temporarily fails
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = (token.role as 'user' | 'admin') || 'user';
        session.user.disabled = !!token.disabled;
      }
      return session;
    },
  },
};

