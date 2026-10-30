export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatShortSha(sha?: string | null): string {
  if (!sha) return '—';
  return sha.substring(0, 7);
}

export function getMethodColor(method: string): string {
  const m = method.toUpperCase();
  switch (m) {
    case 'GET':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    case 'POST':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'PUT':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'PATCH':
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30';
    case 'DELETE':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    default:
      return 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/30';
  }
}
