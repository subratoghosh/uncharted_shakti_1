// components/charts/RunsBarChart.tsx
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

type DataPoint = { status: string; count: number };

type Props = { data: DataPoint[] };

function barFill(status: string): string {
  switch (status) {
    case 'completed':
      return 'var(--ok)';
    case 'failed':
      return 'var(--sev-breaking)';
    case 'running':
      return 'var(--accent)';
    default:
      return 'var(--text-muted)';
  }
}

export function RunsBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="status"
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'var(--surface-2)' }}
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text)',
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={barFill(entry.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
