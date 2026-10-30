'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm p-6 bg-surface border border-border rounded-lg space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Create ShaktIQ Account</h1>
          <p className="text-sm text-muted">Register to monitor your OpenAPI specifications</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-sev-breaking/10 border border-sev-breaking/30 text-sev-breaking rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
            />
          </div>

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
              minLength={8}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-xs text-center text-muted">
          Already registered?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
