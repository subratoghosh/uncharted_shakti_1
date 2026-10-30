'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { formatDate } from '../../../../lib/format';
import { Users, Shield, UserX, UserCheck } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  disabled: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient<User[]>('/admin/users'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ userId, disabled }: { userId: string; disabled: boolean }) =>
      apiClient(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ disabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Users</h1>
        <p className="text-sm text-muted">
          Manage developer accounts and platform administrator roles
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span>Users ({users.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Registered</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    No users registered.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-surface-2 transition-colors">
                    <td className="p-3 font-semibold text-text">{u.name}</td>
                    <td className="p-3 font-mono text-muted">{u.email}</td>
                    <td className="p-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-2 text-muted border border-border uppercase">
                          User
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.disabled ? (
                        <span className="text-sev-breaking font-semibold">Disabled</span>
                      ) : (
                        <span className="text-ok font-semibold">Active</span>
                      )}
                    </td>
                    <td className="p-3 text-muted">{formatDate(u.createdAt)}</td>
                    <td className="p-3 text-right">
                      {u.email !== 'admin@shaktiq.dev' && (
                        <button
                          onClick={() =>
                            toggleMutation.mutate({ userId: u.id, disabled: !u.disabled })
                          }
                          disabled={toggleMutation.isPending}
                          className="inline-flex items-center gap-1 text-xs text-muted hover:text-text font-medium"
                        >
                          {u.disabled ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-ok" />
                              <span>Enable</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5 text-sev-breaking" />
                              <span>Disable</span>
                            </>
                          )}
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
