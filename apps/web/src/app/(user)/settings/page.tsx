'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatDate } from '@/lib/format';
import { User, LogOut, Shield } from 'lucide-react';
import type { User as UserType } from '@shaktiq/shared';

export default function SettingsPage() {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.auth.me(),
  });

  const user: UserType | null = data?.ok ? data.data : null;

  async function handleLogout() {
    try {
      await apiClient.auth.logout();
    } catch {
      // ignore
    } finally {
      router.push('/login');
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-h2 font-semibold text-[var(--text)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Profile, session credentials, and user preferences
        </p>
      </div>

      {error ? (
        <ErrorState
          code="USER_LOAD_FAILED"
          message="Could not load profile."
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 animate-pulse">
          <div className="h-5 w-32 bg-[var(--surface-2)] rounded" />
          <div className="h-4 w-48 bg-[var(--surface-2)] rounded" />
        </div>
      ) : user ? (
        <div className="space-y-6">
          <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              <span>User Profile</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-[var(--border)]">
              <div>
                <span className="text-[var(--text-muted)] block">Name</span>
                <span className="text-sm font-medium text-[var(--text)]">{user.name}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Email</span>
                <span className="text-sm font-mono text-[var(--text)]">{user.email}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Role</span>
                <span className="text-xs font-semibold capitalize text-[var(--text)]">{user.role}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Member Since</span>
                <span className="text-xs text-[var(--text)]">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Session</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Sign out of this session. Next.js communicates with Fastify via HTTP-only secure cookie JWTs.
            </p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 h-9 px-4 rounded border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--sev-breaking)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--sev-breaking)]"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
