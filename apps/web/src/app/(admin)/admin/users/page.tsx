'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { formatDate } from '../../../../lib/format';
import { Users, Shield, UserX, UserCheck, ShieldAlert, CheckCircle2, UserCog } from 'lucide-react';

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
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  const { data: users = [], isLoading, error: queryError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient<User[]>('/admin/users'),
  });

  // Mutation to toggle suspension status (disabled true/false)
  const toggleSuspendMutation = useMutation({
    mutationFn: ({ userId, disabled }: { userId: string; disabled: boolean }) =>
      apiClient(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ disabled }),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setFeedback({
        type: 'ok',
        message: `User successfully ${vars.disabled ? 'suspended' : 'activated'}.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: Error) => {
      setFeedback({
        type: 'err',
        message: err.message || 'Failed to update user status.',
      });
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  // Mutation to change user role ('admin' <-> 'user')
  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'admin' }) =>
      apiClient(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setFeedback({
        type: 'ok',
        message: `User role successfully updated to ${vars.role.toUpperCase()}.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: Error) => {
      setFeedback({
        type: 'err',
        message: err.message || 'Failed to update user role.',
      });
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">User Management</h1>
          <p className="text-sm text-muted">
            Manage user roles, platform administrators, and suspend/activate developer accounts
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div
          className={`p-3.5 text-xs rounded-md border flex items-center gap-2 transition-all ${
            feedback.type === 'ok'
              ? 'bg-ok/10 border-ok/30 text-ok'
              : 'bg-sev-breaking/10 border-sev-breaking/30 text-sev-breaking'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {queryError && (
        <div className="p-4 text-xs bg-sev-breaking/10 border border-sev-breaking/30 text-sev-breaking rounded-md">
          {(queryError as Error).message || 'Failed to load user list'}
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span>Platform Users ({users.length})</span>
          </h2>
          <span className="text-[11px] text-muted">
            Role changes and suspensions apply immediately to active sessions and database records.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 border-b border-border text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5 text-right">Actions</th>
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
                    No users registered in system.
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isRootAdmin = u.email === 'admin@shaktiq.dev';
                  const isMutating =
                    (toggleSuspendMutation.isPending &&
                      toggleSuspendMutation.variables?.userId === u.id) ||
                    (changeRoleMutation.isPending &&
                      changeRoleMutation.variables?.userId === u.id);

                  return (
                    <tr key={u.id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="p-3.5 font-semibold text-text">{u.name}</td>
                      <td className="p-3.5 font-mono text-muted">{u.email}</td>
                      <td className="p-3.5">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-surface-2 text-muted border border-border uppercase">
                            User
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {u.disabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sev-breaking/10 text-sev-breaking border border-sev-breaking/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-sev-breaking" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-muted">{formatDate(u.createdAt)}</td>
                      <td className="p-3.5 text-right">
                        {isRootAdmin ? (
                          <span className="text-[11px] text-muted italic">System Root</span>
                        ) : (
                          <div className="inline-flex items-center gap-2 justify-end">
                            {/* Role changer dropdown/button */}
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() =>
                                changeRoleMutation.mutate({
                                  userId: u.id,
                                  role: u.role === 'admin' ? 'user' : 'admin',
                                })
                              }
                              title={
                                u.role === 'admin' ? 'Demote to regular user' : 'Promote to admin'
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-border bg-surface-2 hover:bg-border/60 text-text transition-colors disabled:opacity-50"
                            >
                              <UserCog className="w-3 h-3 text-muted" />
                              <span>{u.role === 'admin' ? 'Demote to User' : 'Make Admin'}</span>
                            </button>

                            {/* Suspend / Activate button */}
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() =>
                                toggleSuspendMutation.mutate({
                                  userId: u.id,
                                  disabled: !u.disabled,
                                })
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors disabled:opacity-50 ${
                                u.disabled
                                  ? 'bg-ok/10 hover:bg-ok/20 border-ok/30 text-ok'
                                  : 'bg-sev-breaking/10 hover:bg-sev-breaking/20 border-sev-breaking/30 text-sev-breaking'
                              }`}
                            >
                              {u.disabled ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Activate</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Suspend</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
