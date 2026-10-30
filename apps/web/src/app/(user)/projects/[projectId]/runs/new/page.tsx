'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { ErrorState } from '@/components/shared/ErrorState';
import { Upload, Play, AlertCircle } from 'lucide-react';
import type { Project } from '@shaktiq/shared';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function NewRunPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  const router = useRouter();

  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [headFile, setHeadFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  const { data: projectRes } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.projects.get(projectId),
  });

  const project: Project | null = projectRes?.ok ? projectRes.data : null;

  const runMutation = useMutation({
    mutationFn: (formData: FormData) => apiClient.runs.manualRun(projectId, formData),
    onSuccess: (res) => {
      if (res.ok) {
        router.push(`/runs/${res.data.id}`);
      }
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Analysis trigger failed');
    },
  });

  function validateFile(file: File): string | null {
    if (file.size > MAX_BYTES) {
      return `File ${file.name} exceeds the 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['yaml', 'yml', 'json'].includes(ext ?? '')) {
      return `File ${file.name} must be a YAML or JSON specification.`;
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!baseFile || !headFile) {
      setError('Both base and head specification files are required.');
      return;
    }

    const baseErr = validateFile(baseFile);
    if (baseErr) {
      setError(baseErr);
      return;
    }

    const headErr = validateFile(headFile);
    if (headErr) {
      setError(headErr);
      return;
    }

    const formData = new FormData();
    formData.append('baseSpec', baseFile);
    formData.append('headSpec', headFile);
    if (label.trim()) {
      formData.append('label', label.trim());
    }

    runMutation.mutate(formData);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div>
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)] mb-1">
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/projects/${projectId}`} className="hover:underline">
            {project?.name ?? '…'}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-[var(--text)] font-medium">New run</span>
        </nav>
        <h1 className="text-h2 font-semibold text-[var(--text)]">Run Manual Analysis</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Upload base and head OpenAPI specs (3.0/3.1) to detect breaking changes deterministically.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-card p-4 sev-breaking-bg text-sm text-[var(--sev-breaking)]">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
        {/* Base spec */}
        <div className="space-y-2">
          <label htmlFor="baseSpec" className="block text-sm font-medium text-[var(--text)]">
            Base Specification (Previous Version) <span className="text-[var(--sev-breaking)]">*</span>
          </label>
          <div className="rounded border border-dashed border-[var(--border)] p-4 hover:border-[var(--text-muted)] transition-colors">
            <input
              id="baseSpec"
              name="baseSpec"
              type="file"
              accept=".yaml,.yml,.json"
              required
              onChange={(e) => setBaseFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-[var(--text-muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--surface-2)] file:text-[var(--text)] hover:file:opacity-80"
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
              OpenAPI 3.0 or 3.1 YAML/JSON. Maximum size: 5 MB.
            </p>
          </div>
        </div>

        {/* Head spec */}
        <div className="space-y-2">
          <label htmlFor="headSpec" className="block text-sm font-medium text-[var(--text)]">
            Head Specification (Current Version) <span className="text-[var(--sev-breaking)]">*</span>
          </label>
          <div className="rounded border border-dashed border-[var(--border)] p-4 hover:border-[var(--text-muted)] transition-colors">
            <input
              id="headSpec"
              name="headSpec"
              type="file"
              accept=".yaml,.yml,.json"
              required
              onChange={(e) => setHeadFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-[var(--text-muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--surface-2)] file:text-[var(--text)] hover:file:opacity-80"
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
              The proposed update to compare against the base spec.
            </p>
          </div>
        </div>

        {/* Optional Label */}
        <div className="space-y-1.5">
          <label htmlFor="label" className="block text-sm font-medium text-[var(--text)]">
            Run Label / Notes (Optional)
          </label>
          <input
            id="label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. PR #42 test build"
            className="w-full h-9 rounded border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <Link
            href={`/projects/${projectId}`}
            className="h-9 px-4 rounded border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--surface-2)] flex items-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={runMutation.isPending}
            className="inline-flex items-center gap-2 h-9 px-4 rounded bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {runMutation.isPending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden />
                Run analysis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

