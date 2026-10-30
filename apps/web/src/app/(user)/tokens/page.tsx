'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonRows } from '@/components/shared/SkeletonRow';
import { formatDate } from '@/lib/format';
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';
import type { ApiToken, ApiTokenCreated } from '@shaktiq/shared';

export default function TokensPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [createdToken, setCreatedToken] = useState<ApiTokenCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => apiClient.tokens.list(),
  });

  const createMutation = useMutation({
    mutationFn: (tokenName: string) => apiClient.tokens.create(tokenName),
    onSuccess: (res) => {
      if (res.ok) {
        setCreatedToken(res.data);
        setName('');
        void queryClient.invalidateQueries({ queryKey: ['tokens'] });
      }
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to generate token');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (tokenId: string) => apiClient.tokens.revoke(tokenId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    createMutation.mutate(name.trim());
  }

  function handleCopy() {
    if (!createdToken?.rawToken) return;
    void navigator.clipboard.writeText(createdToken.rawToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRevoke(token: ApiToken) {
    if (confirm(`Revoke token "${token.name}"? Any VS Code extensions using it will lose access immediately.`)) {
      revokeMutation.mutate(token.id);
    }
  }

  const tokens: ApiToken[] = data?.ok && Array.isArray(data.data) ? data.data : [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-h2 font-semibold text-[var(--text)]">Personal Access Tokens</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Generate API tokens for the ShaktIQ VS Code extension to analyze OpenAPI specs locally before commit.
        </p>
      </div>

      {/* Raw token created notification box */}
      {createdToken && (
        <div className="rounded-card border border-[var(--ok-border)] ok-bg p-5 space-y-3">
          <div className="flex items-center gap-2 text-[var(--ok)] font-medium text-sm">
            <Check className="h-4 w-4" aria-hidden />
            <span>Token Generated Successfully</span>
          </div>
          <p className="text-xs text-[var(--text)]">
            Copy this token now. It is stored as a SHA-256 hash and <span className="font-semibold">will never be displayed again</span>.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={createdToken.rawToken}
              className="w-full h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-mono text-[var(--text)] select-all"
            />
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-[var(--accent)] text-white text-xs font-medium shrink-0 hover:opacity-90"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Create token form */}
      <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
          <Key className="h-4 w-4 text-[var(--accent)]" aria-hidden />
          <span>Generate New Token</span>
        </h2>
        {error && (
          <div role="alert" className="sev-breaking-bg rounded p-3 text-xs text-[var(--sev-breaking)]">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Token description (e.g. laptop-vscode)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={createMutation.isPending || !name.trim()}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span>{createMutation.isPending ? 'Generating…' : 'Generate token'}</span>
          </button>
        </form>
      </div>

      {/* Tokens List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text)]">Active Tokens</h2>
        {queryError ? (
          <ErrorState
            code="FETCH_ERROR"
            message="Failed to load API tokens."
            onRetry={() => void refetch()}
          />
        ) : (
          <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                  <tr className="h-10 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    <th scope="col" className="px-4">Name</th>
                    <th scope="col" className="px-4">Token Prefix</th>
                    <th scope="col" className="px-4">Last Used</th>
                    <th scope="col" className="px-4">Created</th>
                    <th scope="col" className="px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-sm">
                  {isLoading ? (
                    <SkeletonRows cols={5} rows={3} />
                  ) : tokens.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <EmptyState
                          title="No tokens generated"
                          description="Create your first token to authenticate the VS Code extension."
                        />
                      </td>
                    </tr>
                  ) : (
                    tokens.map((token) => (
                      <tr key={token.id} className="h-10 hover:bg-[var(--surface-2)] transition-colors">
                        <td className="px-4 font-medium text-[var(--text)] whitespace-nowrap">
                          {token.name}
                        </td>
                        <td className="px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {token.prefix}…
                        </td>
                        <td className="px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {token.lastUsedAt ? formatDate(token.lastUsedAt) : 'Never'}
                        </td>
                        <td className="px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {formatDate(token.createdAt)}
                        </td>
                        <td className="px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleRevoke(token)}
                            disabled={revokeMutation.isPending}
                            className="text-xs text-[var(--sev-breaking)] hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-[var(--sev-breaking)]"
                            title="Revoke token"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden />
                            <span>Revoke</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

