'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@shaktiq.dev');
  const [password, setPassword] = useState('AdminSecurePassword123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to sign in. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm p-6 bg-surface border border-border rounded-lg space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Sign In to ShaktIQ</h1>
          <p className="text-sm text-muted">API Compatibility & Release Intelligence</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-sev-breaking/10 border border-sev-breaking/30 text-sev-breaking rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-accent text-white text-sm font-semibold rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-xs text-center text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
