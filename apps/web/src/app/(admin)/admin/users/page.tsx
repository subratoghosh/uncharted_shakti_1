'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonRows } from '@/components/shared/SkeletonRow';
import { formatDate } from '@/lib/format';
import type { User } from '@shaktiq/shared';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.admin.users(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ userId, disabled }: { userId: string; disabled: boolean }) =>
      apiClient.admin.updateUser(userId, { disabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const users: User[] = data?.ok && Array.isArray(data.data) ? data.data : [];

  function handleToggle(user: User) {
    const action = user.disabled ? 'enable' : 'disable';
    if (confirm(`Are you sure you want to ${action} user ${user.email}?`)) {
      toggleMutation.mutate({ userId: user.id, disabled: !user.disabled });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-semibold text-[var(--text)]">Users Management</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Platform accounts, role assignments, and access control
        </p>
      </div>

      {error ? (
        <ErrorState
          code="FETCH_ERROR"
          message={error instanceof Error ? error.message : 'Failed to load users'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                <tr className="h-10 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  <th scope="col" className="px-4">Name</th>
                  <th scope="col" className="px-4">Email</th>
                  <th scope="col" className="px-4">Role</th>
                  <th scope="col" className="px-4">Status</th>
                  <th scope="col" className="px-4">Created</th>
                  <th scope="col" className="px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-sm">
                {isLoading ? (
                  <SkeletonRows cols={6} rows={4} />
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <EmptyState
                        title="No users found"
                        description="No registered users in the database."
                      />
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="h-10 hover:bg-[var(--surface-2)] transition-colors">
                      <td className="px-4 font-medium text-[var(--text)] whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded text-xs px-2 py-0.5 font-medium ${
                            user.role === 'admin'
                              ? 'text-[var(--accent)] bg-[rgba(107,140,255,0.1)] border border-[rgba(107,140,255,0.3)]'
                              : 'text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)]'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded text-xs px-2 py-0.5 font-medium ${
                            user.disabled
                              ? 'text-[var(--sev-breaking)] sev-breaking-bg'
                              : 'text-[var(--ok)] ok-bg'
                          }`}
                        >
                          {user.disabled ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={toggleMutation.isPending}
                          className="text-xs font-medium text-[var(--text)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        >
                          {user.disabled ? 'Enable' : 'Disable'}
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
  );
}
