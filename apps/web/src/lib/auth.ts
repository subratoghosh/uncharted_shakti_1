import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import { verifyPassword, hashPassword } from './password';

// Ensure NEXTAUTH_URL is defined with https:// protocol in Vercel / production environments
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NODE_ENV === 'production') {
    process.env.NEXTAUTH_URL = 'https://shaktiq.vercel.app';
  } else {
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  }
}

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  '139814236478-rm3tfc4u6ns0lmj7n9p2m0vp3hiigiun.apps.googleusercontent.com';
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET || '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';

const githubClientId = process.env.GITHUB_CLIENT_ID || 'Ov23liOg6gAdXEQ0zqtU';
const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET || '1e2e1e3f492b77eae2f213e69f09e8bbd3412aca';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    'shaktiq-nextauth-super-secret-production-and-development-key-32-chars-long!',
  useSecureCookies: process.env.NODE_ENV === 'production' || !!process.env.VERCEL,
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

        const isValid = await verifyPassword(user.passwordHash, credentials.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        // Seamlessly migrate legacy hashes to pure scrypt on successful login
        if (typeof user.passwordHash === 'string' && user.passwordHash.startsWith('$argon2')) {
          hashPassword(credentials.password)
            .then((newHash) => {
              users.updateOne({ _id: user._id }, { $set: { passwordHash: newHash } }).catch(() => {});
            })
            .catch(() => {});
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
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (!user.email) return false;

        const db = await getDb();
        const users = db.collection('users');
        const normalizedEmail = user.email.toLowerCase().trim();

        // Sync with alternative database name (shaktiIQ / shaktiq) to guarantee data visibility across Atlas views
        const altDbName = db.databaseName === 'shaktiIQ' ? 'shaktiq' : 'shaktiIQ';
        let altUsers: any = null;
        try {
          const altDb = await getDb(altDbName);
          altUsers = altDb.collection('users');
        } catch {
          // Alt db sync is non-blocking
        }

        let existing = await users.findOne({ email: normalizedEmail });
        if (!existing && altUsers) {
          existing = await altUsers.findOne({ email: normalizedEmail });
        }

        if (existing) {
          // If the user was suspended by admin or in the DB, reject login
          if (existing.disabled) {
            return '/login?error=AccountSuspended';
          }

          user.id = existing._id.toHexString();
          user.role = existing.role || 'user';
          user.disabled = !!existing.disabled;

          const updatePayload = {
            $set: {
              name: user.name || existing.name,
              image: user.image || existing.image,
              lastLoginAt: new Date(),
              updatedAt: new Date(),
            },
          };

          // Update profile information in primary and alt database
          await users.updateOne({ _id: existing._id }, updatePayload);
          if (altUsers) {
            await altUsers.updateOne({ email: normalizedEmail }, updatePayload, { upsert: true }).catch(() => {});
          }
        } else {
          // New OAuth user registration
          const now = new Date();
          const newDoc = {
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
          };

          const insertResult = await users.insertOne(newDoc);
          if (altUsers) {
            await altUsers.replaceOne({ email: normalizedEmail }, newDoc, { upsert: true }).catch(() => {});
          }

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
