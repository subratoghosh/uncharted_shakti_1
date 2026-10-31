'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  GitCommit,
  Layers,
  History,
  Key,
  Database,
  RefreshCw,
  Search,
  ChevronRight,
  X,
  FileCode,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { ShaktiqLogoIcon } from '@/components/shared/ShaktiqLogoIcon';
import { Skeleton } from '@/components/common/Skeleton';
import { CodeIntelligenceStudio } from '@/components/CodeIntelligenceStudio';

const AiReleaseDossier = dynamic(
  () => import('@/components/AiReleaseDossier').then((mod) => mod.AiReleaseDossier),
  {
    loading: () => (
      <div className="rounded-3xl p-6 bg-[#082820] text-butter-cream space-y-4 border border-[#0C382E]/40 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton variant="dark" className="h-5 w-48" rounded="md" />
          <Skeleton variant="dark" className="h-4 w-28" rounded="full" />
        </div>
        <div className="p-4 rounded-2xl bg-black/30 space-y-2">
          <Skeleton variant="dark" className="h-4 w-3/4" rounded="sm" />
          <Skeleton variant="dark" className="h-4 w-1/2" rounded="sm" />
          <Skeleton variant="dark" className="h-4 w-5/6" rounded="sm" />
        </div>
      </div>
    ),
    ssr: false,
  }
);
import type {
  Project,
  Run,
  Finding,
  Hotspot,
  ApiToken,
  WebhookEvent,
  AdminOverview,
  CompareResult,
  AnalyzerResult,
  AuthUser,
  MultiLayerDossier,
} from '@/types/index';

// Demo sample specs for instant testing
const sampleBaseSpec = `openapi: 3.0.0
info:
  title: Orders Service
  version: 1.0.0
paths:
  /orders:
    get:
      summary: List all orders
      responses:
        '200':
          description: OK
    post:
      summary: Create an order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                customerId:
                  type: string
                amount:
                  type: number
  /orders/{id}:
    delete:
      summary: Cancel an order
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: No Content
`;

const sampleHeadSpec = `openapi: 3.0.0
info:
  title: Orders Service
  version: 2.0.0
paths:
  /orders:
    get:
      summary: List all orders
      responses:
        '200':
          description: OK
    post:
      summary: Create an order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - customerId
                - paymentMethodId
              properties:
                customerId:
                  type: string
                paymentMethodId:
                  type: string
                amount:
                  type: string
`;

export default function ShaktIQDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'studio' | 'runs' | 'compare' | 'memory' | 'dossier' | 'analyzer' | 'tokens' | 'admin'>('overview');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [adminEvents, setAdminEvents] = useState<WebhookEvent[]>([]);
  const [aiDossier, setAiDossier] = useState<MultiLayerDossier | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<number | null>(null);

  // Compare states
  const [compareBaseId, setCompareBaseId] = useState('');
  const [compareHeadId, setCompareHeadId] = useState('');
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [compareTab, setCompareTab] = useState<'new' | 'resolved' | 'unresolved'>('new');

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Analyzer state
  const [analyzerBase, setAnalyzerBase] = useState(sampleBaseSpec);
  const [analyzerHead, setAnalyzerHead] = useState(sampleHeadSpec);
  const [analyzerResult, setAnalyzerResult] = useState<AnalyzerResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // New Project Modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectRepo, setNewProjectRepo] = useState('');
  const [newProjectBranch, setNewProjectBranch] = useState('main');
  const [newProjectSpec, setNewProjectSpec] = useState('openapi.yaml');

  // New Token Modal
  const [showNewTokenModal, setShowNewTokenModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [createdTokenSecret, setCreatedTokenSecret] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Auth check & initial load
  useEffect(() => {
    async function init() {
      try {
        const me = await api.getMe();
        setUser(me);
      } catch {
        if (session?.user) {
          setUser({
            id: session.user.id || 'usr_current',
            email: session.user.email || 'developer@test.com',
            name: session.user.name || session.user.email?.split('@')[0] || 'User',
            role: (session.user.role as 'user' | 'admin') || 'user',
          });
        }
      }
    }
    init();
  }, [session]);

  // Load projects & tokens when user is available
  useEffect(() => {
    if (!user) return;
    loadProjects();
    loadTokens();
    loadAdminData();
  }, [user]);

  async function loadProjects() {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0]._id || data[0].id || '');
      }
    } catch {
      // ignore
    }
  }

  async function loadTokens() {
    try {
      const data = await api.getTokens();
      setTokens(data);
    } catch {
      // ignore
    }
  }

  async function loadAdminData() {
    try {
      const [overview, events] = await Promise.all([
        api.getAdminOverview().catch(() => null),
        api.getAdminEvents().catch(() => []),
      ]);
      setAdminOverview(overview);
      setAdminEvents(events);
    } catch {
      // ignore
    }
  }

  // Load project runs & hotspots when selected project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    loadProjectDetails(selectedProjectId);
  }, [selectedProjectId]);

  async function loadProjectDetails(projectId: string) {
    try {
      const [runsRes, hotspotsRes] = await Promise.all([
        api.getRuns(projectId, { limit: 20 }),
        api.getHotspots(projectId, 10).catch(() => []),
      ]);
      const runsList = Array.isArray(runsRes) ? runsRes : [];
      setRuns(runsList);
      setHotspots(Array.isArray(hotspotsRes) ? hotspotsRes : []);
      if (runsList.length > 0) {
        setSelectedRun(runsList[0]);
        loadRunFindings(projectId, runsList[0]._id || runsList[0].id || '');
        loadAiDossier(projectId, runsList[0]._id || runsList[0].id || '');
      } else {
        setSelectedRun(null);
        setFindings([]);
        setAiDossier(null);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load project runs';
      setErrorMsg(msg);
    }
  }

  async function loadRunFindings(projectId: string, runId: string) {
    try {
      const res = await api.getRunFindings(projectId, runId);
      setFindings(res);
    } catch {
      // ignore
    }
  }

  async function loadAiDossier(projectId: string, runId: string) {
    setLoadingDossier(true);
    try {
      const res = await api.getAiDossier(projectId, runId);
      setAiDossier(res);
    } catch {
      // ignore
    } finally {
      setLoadingDossier(false);
    }
  }

  // Live SSE Connection
  useEffect(() => {
    const streamUrl = api.getStreamUrl();
    let es: EventSource | null = null;
    try {
      es = new EventSource(streamUrl, { withCredentials: true });
      es.onopen = () => setSseConnected(true);
      es.onerror = () => setSseConnected(false);
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'run.updated' && selectedProjectId) {
            loadProjectDetails(selectedProjectId);
          }
        } catch {
          // ignore
        }
      };
    } catch {
      setSseConnected(false);
    }
    return () => {
      if (es) es.close();
    };
  }, [selectedProjectId]);

  // Handle direct analyzer compare
  async function handleAnalyze() {
    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const result = await api.analyzeSpecs({
        baseSpec: analyzerBase,
        headSpec: analyzerHead,
      });
      setAnalyzerResult(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Analysis failed';
      setErrorMsg(msg);
    } finally {
      setAnalyzing(false);
    }
  }

  // Handle create project
  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    try {
      const project = await api.createProject({
        name: newProjectName,
        repositoryUrl: newProjectRepo,
        defaultBranch: newProjectBranch,
        specPath: newProjectSpec,
      });
      setShowNewProjectModal(false);
      setNewProjectName('');
      setNewProjectRepo('');
      await loadProjects();
      setSelectedProjectId(project._id || project.id || '');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create project';
      setErrorMsg(msg);
    }
  }

  // Handle create token
  async function handleCreateToken(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.createToken({ name: newTokenName });
      setCreatedTokenSecret(res.token);
      setNewTokenName('');
      loadTokens();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create token';
      setErrorMsg(msg);
    }
  }

  // Handle Compare
  async function handleCompare() {
    if (!compareBaseId || !compareHeadId || !selectedProjectId) return;
    try {
      const res = await api.compareRuns(selectedProjectId, compareBaseId, compareHeadId);
      setCompareResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to compare runs';
      setErrorMsg(msg);
    }
  }

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          f.endpoint.toLowerCase().includes(q) ||
          f.method.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [findings, severityFilter, searchQuery]);

  // Method badge color helper
  const getMethodBadgeClass = (method: string) => {
    const m = method.toUpperCase();
    if (m === 'GET') return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    if (m === 'POST') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (m === 'DELETE') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    if (m === 'PUT' || m === 'PATCH') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
  };

  // Severity badge color helper
  const getSeverityBadgeClass = (sev: string) => {
    if (sev === 'breaking') return 'badge-breaking';
    if (sev === 'warning') return 'badge-warning';
    return 'badge-info';
  };

  // Verdict banner text
  const getVerdictText = (status?: string) => {
    if (status === 'safe') return 'Safe based on configured checks';
    if (status === 'review') return 'Warning: review required';
    return 'Not ready: blocking changes detected';
  };

  return (
    <div className="flex h-screen w-full bg-bg text-text overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-surface flex flex-col justify-between select-none">
        <div>
          {/* Logo */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#0A382C] flex items-center justify-center p-1 border border-emerald-500/20 shadow-xs">
                  <ShaktiqLogoIcon className="w-4 h-4" theme="dark" />
                </div>
                <span className="font-extrabold tracking-tight text-base">
                  <span className="text-foreground">shakt</span>
                  <span className="text-[#52B143]">IQ</span>
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">API Release Intelligence</p>
            </div>
          </div>

          {/* Project Picker */}
          <div className="p-3 border-b border-border">
            <label className="text-[11px] uppercase tracking-wider text-text-muted font-medium block mb-1.5 px-1">
              Active Project
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-surface-2 border border-border text-sm rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent font-medium"
              >
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
                {projects.length === 0 && <option value="">No projects found</option>}
              </select>
              <button
                onClick={() => setShowNewProjectModal(true)}
                title="Create Project"
                className="p-1.5 border border-border bg-surface-2 hover:bg-border/40 rounded-md text-text-muted hover:text-text transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-0.5 text-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'overview' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'studio' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Code Studio</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#52B143]/20 text-[#52B143] font-bold border border-[#52B143]/30">
                LIVE
              </span>
            </button>
            <button
              onClick={() => setActiveTab('runs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'runs' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>Runs & Findings</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('dossier');
                if (selectedProjectId && selectedRun) {
                  loadAiDossier(selectedProjectId, selectedRun._id || selectedRun.id || '');
                }
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'dossier' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <Cpu className="w-4 h-4 text-accent" />
              <span>AI Release Dossier</span>
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'compare' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Compare Runs</span>
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'memory' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Hotspot Memory</span>
            </button>
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'analyzer' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Spec Playground</span>
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left ${
                activeTab === 'tokens' ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>API Tokens</span>
            </button>

            {(user?.role === 'admin' || session?.user?.role === 'admin') && (
              <>
                <div className="pt-3 pb-1 px-3 text-[11px] uppercase tracking-wider text-text-muted font-medium flex items-center justify-between">
                  <span>Platform Admin</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-600 px-1 rounded font-bold font-mono">ADMIN</span>
                </div>
                <Link
                  href="/admin/overview"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left text-amber-600 hover:bg-amber-500/10 font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4" />
                    <span>Admin Panel Console</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-border bg-surface-2/50 text-xs">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <span className="font-medium truncate block">{user?.email || 'admin@shaktiq.dev'}</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">
                Role: {user?.role || 'admin'}
              </span>
            </div>
            <button
              onClick={() => loadProjectDetails(selectedProjectId)}
              title="Refresh Data"
              className="p-1.5 hover:bg-surface rounded text-text-muted hover:text-text"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold capitalize tracking-tight">
              {activeTab === 'overview' && 'Project Overview'}
              {activeTab === 'studio' && 'Code Intelligence Studio & Route Review'}
              {activeTab === 'runs' && 'Compatibility Runs & Findings'}
              {activeTab === 'dossier' && 'Multi-Layer AI Release Dossier (Gemini 3.8 Flash)'}
              {activeTab === 'compare' && 'Run to Run Comparison'}
              {activeTab === 'memory' && 'Endpoint History & Hotspots'}
              {activeTab === 'analyzer' && 'Interactive OpenAPI Spec Analyzer'}
              {activeTab === 'tokens' && 'Personal Access Tokens'}
              {activeTab === 'admin' && 'Platform Administration'}
            </h2>
            {selectedProjectId && (
              <span className="text-xs text-text-muted border border-border px-2 py-0.5 rounded bg-surface-2 font-mono">
                {projects.find((p) => (p._id || p.id) === selectedProjectId)?.name || 'Default'}
              </span>
            )}
          </div>

          {/* SSE Live Connection status */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-text-muted">
                {sseConnected ? 'Live Updates Active' : 'Connecting to ChangeStream...'}
              </span>
            </div>
            <span className="text-border">|</span>
            <span className="text-text-muted font-mono">MongoDB 7.0 WiredTiger</span>
          </div>
        </header>

        {/* Global Error Notice if any */}
        {errorMsg && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2.5 text-xs text-rose-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main View Container */}
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB: STUDIO */}
          {activeTab === 'studio' && (
            <div className="space-y-6">
              <CodeIntelligenceStudio
                projects={projects}
                runs={runs}
                activeProject={projects.find((p) => (p._id || p.id) === selectedProjectId) || projects[0] || null}
                onSelectProject={(proj) => setSelectedProjectId(proj._id || proj.id || '')}
              />
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Code Intelligence Studio Workspace */}
              <CodeIntelligenceStudio
                projects={projects}
                runs={runs}
                activeProject={projects.find((p) => (p._id || p.id) === selectedProjectId) || projects[0] || null}
                onSelectProject={(proj) => setSelectedProjectId(proj._id || proj.id || '')}
              />

              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-border bg-surface p-4 rounded-lg">
                  <div className="text-xs text-text-muted font-medium mb-1">Latest Release Status</div>
                  <div className="flex items-center gap-2">
                    {selectedRun?.releaseStatus === 'safe' ? (
                      <CheckCircle2 className="w-5 h-5 text-ok" />
                    ) : selectedRun?.releaseStatus === 'review' ? (
                      <AlertTriangle className="w-5 h-5 text-sev-warning" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-sev-breaking" />
                    )}
                    <span className="text-lg font-bold capitalize">
                      {selectedRun?.releaseStatus || 'No Runs'}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted mt-2">
                    {selectedRun ? `Commit ${selectedRun.headSha?.slice(0, 7) || 'HEAD'}` : 'Awaiting first webhook'}
                  </div>
                </div>

                <div className="border border-border bg-surface p-4 rounded-lg">
                  <div className="text-xs text-text-muted font-medium mb-1">Breaking Findings</div>
                  <div className="text-2xl font-bold text-sev-breaking">
                    {selectedRun?.summary?.breaking ?? 0}
                  </div>
                  <div className="text-[11px] text-text-muted mt-2">Will break existing API clients</div>
                </div>

                <div className="border border-border bg-surface p-4 rounded-lg">
                  <div className="text-xs text-text-muted font-medium mb-1">Warning Findings</div>
                  <div className="text-2xl font-bold text-sev-warning">
                    {selectedRun?.summary?.warning ?? 0}
                  </div>
                  <div className="text-[11px] text-text-muted mt-2">Potentially breaking schema alterations</div>
                </div>

                <div className="border border-border bg-surface p-4 rounded-lg">
                  <div className="text-xs text-text-muted font-medium mb-1">Total Runs Tracked</div>
                  <div className="text-2xl font-bold">{runs.length}</div>
                  <div className="text-[11px] text-text-muted mt-2">Indexed in MongoDB change stream</div>
                </div>
              </div>

              {/* Latest Run Verdict Banner */}
              {selectedRun && (
                <div
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    selectedRun.releaseStatus === 'safe'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : selectedRun.releaseStatus === 'review'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {selectedRun.releaseStatus === 'safe' ? (
                      <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-sm">
                        {getVerdictText(selectedRun.releaseStatus)}
                      </div>
                      <div className="text-xs opacity-80 mt-0.5">
                        Run ID: {selectedRun._id || selectedRun.id} • Source: {selectedRun.source} • Branch:{' '}
                        {selectedRun.headBranch || 'main'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('runs')}
                    className="text-xs font-semibold underline hover:opacity-80"
                  >
                    View All {findings.length} Findings &rarr;
                  </button>
                </div>
              )}

              {/* Grid: Recent Runs & Hotspots */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Runs Table */}
                <div className="lg:col-span-2 border border-border bg-surface rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Recent Analysis Runs</h3>
                    <button
                      onClick={() => setActiveTab('runs')}
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      View all
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-2 text-text-muted border-b border-border">
                        <tr>
                          <th className="py-2.5 px-4 font-medium">Commit / Ref</th>
                          <th className="py-2.5 px-4 font-medium">Verdict</th>
                          <th className="py-2.5 px-4 font-medium">Findings</th>
                          <th className="py-2.5 px-4 font-medium">Source</th>
                          <th className="py-2.5 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {runs.slice(0, 5).map((r) => (
                          <tr
                            key={r._id || r.id}
                            onClick={() => {
                              setSelectedRun(r);
                              loadRunFindings(selectedProjectId, r._id || r.id || '');
                              setActiveTab('runs');
                            }}
                            className="hover:bg-surface-2/60 cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-medium">
                              {r.headSha?.slice(0, 7) || 'manual'}
                              <span className="block text-[11px] text-text-muted font-sans">
                                {r.headBranch || 'main'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                  r.releaseStatus === 'safe'
                                    ? 'badge-ok'
                                    : r.releaseStatus === 'review'
                                    ? 'badge-warning'
                                    : 'badge-breaking'
                                }`}
                              >
                                {r.releaseStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              <span className="text-sev-breaking font-semibold">{r.summary?.breaking || 0}B</span>{' '}
                              <span className="text-sev-warning">{r.summary?.warning || 0}W</span>{' '}
                              <span className="text-sev-info">{r.summary?.info || 0}I</span>
                            </td>
                            <td className="py-3 px-4 text-text-muted capitalize">{r.source}</td>
                            <td className="py-3 px-4 text-text-muted capitalize">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {runs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-text-muted">
                              No runs found for this project. Trigger a run or push to GitHub to generate an analysis.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Hotspot Endpoints Card */}
                <div className="border border-border bg-surface rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm flex items-center gap-1.5">
                      <History className="w-4 h-4 text-accent" />
                      Recurring Hotspots
                    </h3>
                    <span className="text-[11px] text-text-muted font-medium">≥2 runs</span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Endpoints where breaking changes have recurred across multiple runs (Project Memory).
                  </p>

                  <div className="space-y-2 pt-2">
                    {hotspots.map((h, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-md border border-border bg-surface-2/40 hover:bg-surface-2 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] border ${getMethodBadgeClass(h.method)}`}>
                            {h.method}
                          </span>
                          <span className="badge-breaking px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {h.distinctRuns} runs broken
                          </span>
                        </div>
                        <div className="font-mono text-xs mt-1.5 font-medium truncate" title={h.endpoint}>
                          {h.endpoint}
                        </div>
                      </div>
                    ))}
                    {hotspots.length === 0 && (
                      <div className="text-xs text-text-muted py-6 text-center border border-dashed border-border rounded-md">
                        No recurring hotspot endpoints detected yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Disclaimer footer per FR-5 */}
              <div className="text-[11px] text-text-muted text-center pt-4 border-t border-border">
                *This report assesses API compatibility based on the OpenAPI specifications provided. It does not guarantee the release is safe.*
              </div>
            </div>
          )}

          {/* TAB: RUNS & FINDINGS */}
          {activeTab === 'runs' && (
            <div className="space-y-6">
              {/* Run Selector Header */}
              <div className="border border-border bg-surface rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-text-muted font-medium">Select Run:</div>
                  <select
                    value={selectedRun?._id || selectedRun?.id || ''}
                    onChange={(e) => {
                      const r = runs.find((item) => (item._id || item.id) === e.target.value);
                      setSelectedRun(r || null);
                      if (r) loadRunFindings(selectedProjectId, r._id || r.id || '');
                    }}
                    className="bg-surface-2 border border-border text-xs rounded-md px-3 py-1.5 font-mono focus:outline-none"
                  >
                    {runs.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.headSha?.slice(0, 7) || 'manual'} • {r.releaseStatus?.toUpperCase()} • {r.source} • {new Date(r.createdAt).toLocaleTimeString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      selectedRun?.releaseStatus === 'safe'
                        ? 'badge-ok'
                        : selectedRun?.releaseStatus === 'review'
                        ? 'badge-warning'
                        : 'badge-breaking'
                    }`}
                  >
                    Verdict: {selectedRun?.releaseStatus || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSeverityFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                      severityFilter === 'all'
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface border-border text-text-muted hover:text-text'
                    }`}
                  >
                    All ({findings.length})
                  </button>
                  <button
                    onClick={() => setSeverityFilter('breaking')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                      severityFilter === 'breaking'
                        ? 'bg-sev-breaking text-white border-sev-breaking'
                        : 'bg-surface border-border text-sev-breaking'
                    }`}
                  >
                    Breaking ({findings.filter((f) => f.severity === 'breaking').length})
                  </button>
                  <button
                    onClick={() => setSeverityFilter('warning')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                      severityFilter === 'warning'
                        ? 'bg-sev-warning text-white border-sev-warning'
                        : 'bg-surface border-border text-sev-warning'
                    }`}
                  >
                    Warning ({findings.filter((f) => f.severity === 'warning').length})
                  </button>
                  <button
                    onClick={() => setSeverityFilter('info')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                      severityFilter === 'info'
                        ? 'bg-sev-info text-white border-sev-info'
                        : 'bg-surface border-border text-sev-info'
                    }`}
                  >
                    Info ({findings.filter((f) => f.severity === 'info').length})
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Filter by endpoint, method..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-surface border border-border pl-8 pr-3 py-1.5 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-accent w-64"
                  />
                </div>
              </div>

              {/* Findings Table */}
              <div className="border border-border bg-surface rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 text-text-muted border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4 font-medium w-24">Severity</th>
                      <th className="py-2.5 px-4 font-medium w-24">Method</th>
                      <th className="py-2.5 px-4 font-medium">Endpoint</th>
                      <th className="py-2.5 px-4 font-medium">Change Type</th>
                      <th className="py-2.5 px-4 font-medium">Description</th>
                      <th className="py-2.5 px-4 font-medium w-20">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredFindings.map((f, i) => (
                      <tr
                        key={f._id || f.id || i}
                        onClick={() => setSelectedFinding(f)}
                        className="hover:bg-surface-2/60 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${getSeverityBadgeClass(f.severity)}`}>
                            {f.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getMethodBadgeClass(f.method)}`}>
                            {f.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium truncate max-w-xs">{f.endpoint}</td>
                        <td className="py-3 px-4 font-mono text-text-muted text-[11px]">{f.changeType}</td>
                        <td className="py-3 px-4 text-text-muted truncate max-w-sm">{f.description}</td>
                        <td className="py-3 px-4 text-right">
                          <ChevronRight className="w-4 h-4 text-text-muted inline" />
                        </td>
                      </tr>
                    ))}
                    {filteredFindings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-text-muted">
                          {findings.length === 0 ? 'No findings recorded for this run.' : 'No findings matched the current filter.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: AI RELEASE DOSSIER (MULTI-LAYER INTELLIGENCE) */}
          {activeTab === 'dossier' && (
            <AiReleaseDossier
              aiDossier={aiDossier}
              loadingDossier={loadingDossier}
              selectedRun={selectedRun}
              runs={runs}
              findings={findings}
              onSelectRun={(runId) => {
                const run = runs.find((r) => (r._id || r.id) === runId);
                if (run) {
                  setSelectedRun(run);
                  loadRunFindings(selectedProjectId, run._id || run.id || '');
                  loadAiDossier(selectedProjectId, run._id || run.id || '');
                }
              }}
              onRefreshDossier={() => {
                if (selectedProjectId && selectedRun) {
                  loadAiDossier(selectedProjectId, selectedRun._id || selectedRun.id || '');
                }
              }}
              getMethodBadgeClass={getMethodBadgeClass}
            />
          )}

          {/* TAB: COMPARE RUNS */}
          {activeTab === 'compare' && (
            <div className="space-y-6">
              <div className="border border-border bg-surface p-6 rounded-lg space-y-4">
                <h3 className="font-semibold text-sm">Select Runs to Compare</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted font-medium block mb-1">Base Run (Previous)</label>
                    <select
                      value={compareBaseId}
                      onChange={(e) => setCompareBaseId(e.target.value)}
                      className="w-full bg-surface-2 border border-border p-2 rounded text-xs font-mono"
                    >
                      <option value="">Select Base Run...</option>
                      {runs.map((r) => (
                        <option key={r._id || r.id} value={r._id || r.id}>
                          {r.headSha?.slice(0, 7) || 'manual'} • {r.releaseStatus} ({new Date(r.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted font-medium block mb-1">Head Run (Current)</label>
                    <select
                      value={compareHeadId}
                      onChange={(e) => setCompareHeadId(e.target.value)}
                      className="w-full bg-surface-2 border border-border p-2 rounded text-xs font-mono"
                    >
                      <option value="">Select Head Run...</option>
                      {runs.map((r) => (
                        <option key={r._id || r.id} value={r._id || r.id}>
                          {r.headSha?.slice(0, 7) || 'manual'} • {r.releaseStatus} ({new Date(r.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCompare}
                  disabled={!compareBaseId || !compareHeadId}
                  className="px-4 py-2 bg-accent text-white rounded text-xs font-semibold hover:bg-accent/90 disabled:opacity-50"
                >
                  Run Comparison
                </button>
              </div>

              {/* Compare Results */}
              {compareResult && (
                <div className="space-y-4">
                  {/* Tabs: New / Resolved / Unresolved */}
                  <div className="flex border-b border-border gap-6">
                    <button
                      onClick={() => setCompareTab('new')}
                      className={`pb-2 text-xs font-medium border-b-2 flex items-center gap-1.5 ${
                        compareTab === 'new' ? 'border-sev-breaking text-sev-breaking' : 'border-transparent text-text-muted'
                      }`}
                    >
                      New Findings
                      <span className="px-1.5 py-0.5 rounded bg-sev-breaking/10 text-[10px] font-bold">
                        {compareResult.counts.new}
                      </span>
                    </button>
                    <button
                      onClick={() => setCompareTab('resolved')}
                      className={`pb-2 text-xs font-medium border-b-2 flex items-center gap-1.5 ${
                        compareTab === 'resolved' ? 'border-ok text-ok' : 'border-transparent text-text-muted'
                      }`}
                    >
                      Resolved Findings
                      <span className="px-1.5 py-0.5 rounded bg-ok/10 text-[10px] font-bold">
                        {compareResult.counts.resolved}
                      </span>
                    </button>
                    <button
                      onClick={() => setCompareTab('unresolved')}
                      className={`pb-2 text-xs font-medium border-b-2 flex items-center gap-1.5 ${
                        compareTab === 'unresolved' ? 'border-sev-warning text-sev-warning' : 'border-transparent text-text-muted'
                      }`}
                    >
                      Unresolved Findings
                      <span className="px-1.5 py-0.5 rounded bg-sev-warning/10 text-[10px] font-bold">
                        {compareResult.counts.unresolved}
                      </span>
                    </button>
                  </div>

                  {/* List for active tab */}
                  <div className="border border-border bg-surface rounded-lg divide-y divide-border">
                    {(compareTab === 'new'
                      ? compareResult.newFindings
                      : compareTab === 'resolved'
                      ? compareResult.resolvedFindings
                      : compareResult.unresolvedFindings
                    ).map((f: Finding, i: number) => (
                      <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getMethodBadgeClass(f.method)}`}>
                            {f.method}
                          </span>
                          <span className="font-mono font-medium">{f.endpoint}</span>
                          <span className="text-text-muted">{f.description}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${getSeverityBadgeClass(f.severity)}`}>
                          {f.severity}
                        </span>
                      </div>
                    ))}
                    {(compareTab === 'new' && compareResult.newFindings.length === 0) ||
                    (compareTab === 'resolved' && compareResult.resolvedFindings.length === 0) ||
                    (compareTab === 'unresolved' && compareResult.unresolvedFindings.length === 0) ? (
                      <div className="p-8 text-center text-xs text-text-muted">No findings in this category.</div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: HOTSPOT MEMORY */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div className="border border-border bg-surface p-5 rounded-lg space-y-1">
                <h3 className="font-semibold text-sm">Project Memory & Hotspot Detection</h3>
                <p className="text-xs text-text-muted">
                  Endpoints with recurring breaking changes across previous runs. Powered by MongoDB aggregation pipelines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotspots.map((h, i) => (
                  <div key={i} className="border border-border bg-surface p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${getMethodBadgeClass(h.method)}`}>
                        {h.method}
                      </span>
                      <span className="badge-breaking px-2 py-0.5 rounded text-xs font-bold">
                        {h.distinctRuns} distinct runs broken
                      </span>
                    </div>
                    <div className="font-mono text-sm font-semibold">{h.endpoint}</div>
                    <div className="text-xs text-text-muted pt-2 border-t border-border flex justify-between">
                      <span>Total findings: {h.totalOccurrences || h.distinctRuns}</span>
                      <span>Last broken: {new Date(h.lastSeenAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {hotspots.length === 0 && (
                  <div className="col-span-2 border border-dashed border-border p-12 text-center text-xs text-text-muted rounded-lg">
                    No recurring hotspots recorded yet for this project.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SPEC PLAYGROUND (ANALYZER) */}
          {activeTab === 'analyzer' && (
            <div className="space-y-6">
              <div className="border border-border bg-surface p-5 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Interactive OpenAPI 3.x Diff Playground</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Compare any two specifications directly without pushing code or committing.
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-4 py-2 bg-accent text-white rounded text-xs font-semibold hover:bg-accent/90 flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  {analyzing ? 'Analyzing...' : 'Run Diff'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="border border-border bg-surface rounded-lg p-3 space-y-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Base Spec (V1)</span>
                  <textarea
                    value={analyzerBase}
                    onChange={(e) => setAnalyzerBase(e.target.value)}
                    rows={14}
                    className="w-full bg-surface-2 border border-border rounded font-mono text-xs p-3 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="border border-border bg-surface rounded-lg p-3 space-y-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Head Spec (V2)</span>
                  <textarea
                    value={analyzerHead}
                    onChange={(e) => setAnalyzerHead(e.target.value)}
                    rows={14}
                    className="w-full bg-surface-2 border border-border rounded font-mono text-xs p-3 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Analyzer Results */}
              {analyzerResult && (
                <div className="border border-border bg-surface rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">
                      Analysis Results: {analyzerResult.findings?.length || 0} findings detected
                    </h4>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                        analyzerResult.releaseStatus === 'safe'
                          ? 'badge-ok'
                          : analyzerResult.releaseStatus === 'review'
                          ? 'badge-warning'
                          : 'badge-breaking'
                      }`}
                    >
                      Verdict: {analyzerResult.releaseStatus}
                    </span>
                  </div>

                  <div className="border border-border rounded divide-y divide-border">
                    {analyzerResult.findings?.map((f: Finding, i: number) => (
                      <div key={i} className="p-3 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${getSeverityBadgeClass(f.severity)}`}>
                            {f.severity}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getMethodBadgeClass(f.method)}`}>
                            {f.method}
                          </span>
                          <span className="font-mono font-medium">{f.endpoint}</span>
                          <span className="text-text-muted">{f.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: API TOKENS */}
          {activeTab === 'tokens' && (
            <div className="space-y-6">
              <div className="border border-border bg-surface p-5 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Personal Access Tokens</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Generate tokens (`sq_...`) to authenticate VS Code extensions or CI/CD pipelines.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewTokenModal(true)}
                  className="px-3.5 py-1.5 bg-accent text-white rounded text-xs font-semibold hover:bg-accent/90"
                >
                  Generate New Token
                </button>
              </div>

              {/* Tokens Table */}
              <div className="border border-border bg-surface rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 text-text-muted border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Name</th>
                      <th className="py-2.5 px-4 font-medium">Token Prefix</th>
                      <th className="py-2.5 px-4 font-medium">Created</th>
                      <th className="py-2.5 px-4 font-medium">Last Used</th>
                      <th className="py-2.5 px-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tokens.map((t) => (
                      <tr key={t._id || t.id} className="hover:bg-surface-2/40">
                        <td className="py-3 px-4 font-medium">{t.name}</td>
                        <td className="py-3 px-4 font-mono text-text-muted">{t.tokenPrefix || 'sq_...'}</td>
                        <td className="py-3 px-4 text-text-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-text-muted">
                          {t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              await api.deleteToken(t._id || t.id || '');
                              loadTokens();
                            }}
                            className="text-rose-600 hover:underline"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tokens.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-text-muted">
                          No API tokens generated yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ADMIN CONSOLE */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="border border-border bg-surface p-5 rounded-lg space-y-1">
                <h3 className="font-semibold text-sm">Platform Admin Dashboard</h3>
                <p className="text-xs text-text-muted">
                  Monitor all projects, webhooks, duplicate event deliveries, and system audits.
                </p>
              </div>

              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-border bg-surface p-4 rounded-lg">
                  <div className="text-xs text-text-muted">Total Projects</div>
                  <div className="text-xl font-bold mt-1">{adminOverview?.totalProjects ?? projects.length}</div>
                </div>
                <div className="border border-border bg-surface p-4 rounded-lg">
                  <div className="text-xs text-text-muted">Total Runs Processed</div>
                  <div className="text-xl font-bold mt-1">{adminOverview?.totalRuns ?? runs.length}</div>
                </div>
                <div className="border border-border bg-surface p-4 rounded-lg">
                  <div className="text-xs text-text-muted">Total Webhook Events</div>
                  <div className="text-xl font-bold mt-1">{adminEvents.length}</div>
                </div>
                <div className="border border-border bg-surface p-4 rounded-lg">
                  <div className="text-xs text-text-muted">Duplicate Events Caught</div>
                  <div className="text-xl font-bold mt-1 text-emerald-600">
                    {adminEvents.reduce((acc, curr) => acc + (curr.duplicateCount || 0), 0)}
                  </div>
                </div>
              </div>

              {/* Webhook Events Log */}
              <div className="border border-border bg-surface rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border font-semibold text-xs">
                  Webhook Event Intake & Deduplication Log
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 text-text-muted border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Delivery ID</th>
                      <th className="py-2.5 px-4 font-medium">Event Type</th>
                      <th className="py-2.5 px-4 font-medium">Duplicate Count</th>
                      <th className="py-2.5 px-4 font-medium">Signature Status</th>
                      <th className="py-2.5 px-4 font-medium">Received At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {adminEvents.map((ev) => (
                      <tr key={ev._id || ev.id} className="hover:bg-surface-2/40">
                        <td className="py-2.5 px-4 font-mono">{ev.deliveryId || ev._id?.slice(0, 8)}</td>
                        <td className="py-2.5 px-4 capitalize font-medium">{ev.type || 'push'}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (ev.duplicateCount || 0) > 0 ? 'badge-warning' : 'badge-ok'
                            }`}
                          >
                            {ev.duplicateCount || 0}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-emerald-600 font-medium">Valid (HMAC Verified)</td>
                        <td className="py-2.5 px-4 text-text-muted">{new Date(ev.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {adminEvents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-text-muted">
                          No webhook events logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slide-out Drawer: Finding Detail */}
      {selectedFinding && (
        <div className="fixed inset-y-0 right-0 w-96 bg-surface border-l border-border shadow-2xl p-6 flex flex-col justify-between z-50 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${getSeverityBadgeClass(selectedFinding.severity)}`}>
                {selectedFinding.severity}
              </span>
              <button
                onClick={() => setSelectedFinding(null)}
                className="p-1 hover:bg-surface-2 rounded text-text-muted hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Endpoint</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${getMethodBadgeClass(selectedFinding.method)}`}>
                  {selectedFinding.method}
                </span>
                <span className="font-mono text-sm font-semibold">{selectedFinding.endpoint}</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Change Classification</div>
              <div className="font-mono text-xs mt-1 bg-surface-2 p-2 rounded border border-border">
                {selectedFinding.changeType}
              </div>
            </div>

            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Description</div>
              <p className="text-xs mt-1 text-text leading-relaxed">{selectedFinding.description}</p>
            </div>

            {selectedFinding.impact && (
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Client Impact</div>
                <p className="text-xs mt-1 text-text leading-relaxed bg-rose-500/5 border border-rose-500/20 p-2.5 rounded">
                  {selectedFinding.impact}
                </p>
              </div>
            )}

            {selectedFinding.recommendation && (
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Recommendation</div>
                <p className="text-xs mt-1 text-text leading-relaxed bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded">
                  {selectedFinding.recommendation}
                </p>
              </div>
            )}

            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Fingerprint</div>
              <div className="font-mono text-[10px] break-all text-text-muted mt-1 bg-surface-2 p-1.5 rounded">
                {selectedFinding.fingerprint}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <button
              onClick={() => setSelectedFinding(null)}
              className="w-full py-2 bg-surface-2 hover:bg-border/60 text-xs font-semibold rounded border border-border"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal: New Project */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Register New Project</h3>
              <button onClick={() => setShowNewProjectModal(false)}>
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Orders Service"
                  className="w-full bg-surface-2 border border-border px-3 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Repository URL</label>
                <input
                  type="url"
                  required
                  value={newProjectRepo}
                  onChange={(e) => setNewProjectRepo(e.target.value)}
                  placeholder="https://github.com/my-org/my-repo"
                  className="w-full bg-surface-2 border border-border px-3 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Default Branch</label>
                  <input
                    type="text"
                    value={newProjectBranch}
                    onChange={(e) => setNewProjectBranch(e.target.value)}
                    className="w-full bg-surface-2 border border-border px-3 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Spec Path</label>
                  <input
                    type="text"
                    value={newProjectSpec}
                    onChange={(e) => setNewProjectSpec(e.target.value)}
                    className="w-full bg-surface-2 border border-border px-3 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-1.5 border border-border rounded text-xs text-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-accent text-white rounded text-xs font-semibold hover:bg-accent/90"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Token */}
      {showNewTokenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Generate Personal Access Token</h3>
              <button
                onClick={() => {
                  setShowNewTokenModal(false);
                  setCreatedTokenSecret(null);
                }}
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {createdTokenSecret ? (
              <div className="space-y-3">
                <p className="text-xs text-text-muted">
                  Make sure to copy your personal access token now. You won't be able to see it again!
                </p>
                <div className="flex items-center gap-2 bg-surface-2 border border-border p-2 rounded">
                  <input
                    type="text"
                    readOnly
                    value={createdTokenSecret}
                    className="w-full bg-transparent font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdTokenSecret);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    className="p-1.5 bg-accent text-white rounded text-xs"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowNewTokenModal(false);
                    setCreatedTokenSecret(null);
                  }}
                  className="w-full py-1.5 bg-surface-2 border border-border rounded text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateToken} className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Token Name / Description</label>
                  <input
                    type="text"
                    required
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="e.g. VS Code Extension (Laptop)"
                    className="w-full bg-surface-2 border border-border px-3 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowNewTokenModal(false)}
                    className="px-3 py-1.5 border border-border rounded text-xs text-text-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-accent text-white rounded text-xs font-semibold hover:bg-accent/90"
                  >
                    Generate Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
