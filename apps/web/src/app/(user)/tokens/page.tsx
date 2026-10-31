'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { formatDate } from '../../../lib/format';
import { KeyRound, Plus, Copy, Check, Trash2, AlertTriangle, Code } from 'lucide-react';

type ApiToken = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
};

export default function TokensPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => apiClient<ApiToken[]>('/tokens'),
  });

  const createMutation = useMutation({
    mutationFn: (tokenName: string) =>
      apiClient<{ token: string; apiToken: ApiToken }>('/tokens', {
        method: 'POST',
        body: JSON.stringify({ name: tokenName }),
      }),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      setCreatedToken(data.token);
      setName('');
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to generate token');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (tokenId: string) =>
      apiClient(`/tokens/${tokenId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });

  const handleCopy = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Personal Access Tokens</h1>
        <p className="text-sm text-muted">
          Manage tokens used by the shaktIQ VS Code extension and CLI integrations
        </p>
      </div>

      {/* Token Generation Form */}
      <div className="p-5 bg-surface border border-border rounded-lg space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-accent" />
          <span>Generate New Token</span>
        </h2>

        {error && (
          <div className="p-3 text-xs bg-sev-breaking/10 border border-sev-breaking/30 text-sev-breaking rounded">
            {error}
          </div>
        )}

        {createdToken && (
          <div className="p-4 bg-ok/10 border border-ok/30 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ok">
              <AlertTriangle className="w-4 h-4" />
              <span>Token Generated Successfully! Copy it now (it will never be shown again):</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdToken}
                className="w-full h-9 px-3 font-mono text-xs bg-surface border border-border rounded-sm"
              />
              <button
                onClick={handleCopy}
                className="h-9 px-3 bg-surface border border-border rounded-sm text-xs font-medium hover:bg-surface-2 inline-flex items-center gap-1.5 flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-ok" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={e => {
            e.preventDefault();
            if (name.trim()) createMutation.mutate(name.trim());
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            required
            placeholder="e.g. My Laptop VS Code"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 h-9 px-3 text-sm bg-surface-2 border border-border rounded-sm focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 h-9 bg-accent text-white rounded-sm text-xs font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{createMutation.isPending ? 'Generating...' : 'Generate Token'}</span>
          </button>
        </form>
      </div>

      {/* VS Code Extension Integration Guide */}
      <div className="p-4 bg-surface border border-border rounded-lg space-y-2 text-xs">
        <div className="font-semibold flex items-center gap-1.5 text-accent">
          <Code className="w-4 h-4" />
          <span>Using Tokens in the VS Code Extension</span>
        </div>
        <p className="text-muted leading-relaxed">
          1. Copy your generated token above. <br />
          2. Open Command Palette in VS Code (
          <code className="bg-surface-2 px-1 py-0.5 rounded border border-border">
            Ctrl+Shift+P
          </code>{' '}
          or{' '}
          <code className="bg-surface-2 px-1 py-0.5 rounded border border-border">Cmd+Shift+P</code>
          ). <br />
          3. Run command: <strong className="text-text">shaktIQ: Sign in with token</strong> and
          paste your PAT. <br />
          4. Open any OpenAPI specification and run{' '}
          <strong className="text-text">shaktIQ: Analyze API changes</strong> to see instant
          breaking change diagnostics!
        </p>
      </div>

      {/* Tokens List Table */}
      <div className="bg-surface border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Active Tokens ({tokens.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Prefix</th>
                <th className="p-3">Created</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    Loading tokens...
                  </td>
                </tr>
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    No access tokens created yet.
                  </td>
                </tr>
              ) : (
                tokens.map(t => (
                  <tr key={t.id} className="hover:bg-surface-2 transition-colors">
                    <td className="p-3 font-semibold text-text">{t.name}</td>
                    <td className="p-3 font-mono text-muted">{t.prefix}...</td>
                    <td className="p-3 text-muted">{formatDate(t.createdAt)}</td>
                    <td className="p-3">
                      {t.revokedAt ? (
                        <span className="text-sev-breaking font-medium">Revoked</span>
                      ) : (
                        <span className="text-ok font-medium">Active</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!t.revokedAt && (
                        <button
                          onClick={() => revokeMutation.mutate(t.id)}
                          disabled={revokeMutation.isPending}
                          className="p-1 text-muted hover:text-sev-breaking transition-colors"
                          title="Revoke Token"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
