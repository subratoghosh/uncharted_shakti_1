'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FolderTree,
  Github,
  Upload,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCode,
  Copy,
  Check,
  RotateCcw,
  GitCommit,
  History,
  Wrench,
  Search,
  ChevronRight,
  Shield,
  X,
  RefreshCw,
  Plus,
  ExternalLink,
  Code2,
  Layers,
  Sliders,
  FileText,
  Filter,
  CheckCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import type {
  Project,
  Run,
  DetectedRoute,
  StudioCodeReview,
  StudioCommitMessage,
  StudioCodeFix,
} from '@/types/index';
import { OpenApiGuidanceCard } from '@/components/shared/OpenApiGuidanceCard';

// Optional quick presets if the user explicitly wants to test
const PRESET_OPENAPI = `openapi: 3.0.0
info:
  title: Orders & Checkout API
  version: 2.1.0
  description: Core microservice powering mobile and web checkout flows.
paths:
  /api/v1/orders:
    get:
      summary: List customer orders
      parameters:
        - name: status
          in: query
          required: false
          schema:
            type: string
            enum: [pending, completed, cancelled]
      responses:
        '200':
          description: Orders retrieved successfully
    post:
      summary: Place a new order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [customerId, items, totalAmount]
              properties:
                customerId:
                  type: string
                items:
                  type: array
                  items:
                    type: object
                    properties:
                      sku:
                        type: string
                      quantity:
                        type: integer
                totalAmount:
                  type: number
      responses:
        '201':
          description: Order created
  /api/v1/orders/{id}:
    get:
      summary: Retrieve order by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Order details
    delete:
      summary: Cancel existing order
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Order cancelled
  /api/v1/orders/{id}/refund:
    post:
      summary: Issue customer refund
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                amount:
                  type: number
      responses:
        '200':
          description: Refund accepted`;

const PRESET_CONTROLLER = `import { RouteService, HttpRequest, HttpResponse } from '@core/routing';
import { z } from 'zod';

const createOrderSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(z.object({
    sku: z.string(),
    quantity: z.number().int().positive(),
  })),
  totalAmount: z.number().positive(),
  priorityShipping: z.boolean(),
});

export async function orderRoutes(app: RouteService) {
  // GET /v1/orders
  app.get('/v1/orders', async (req: HttpRequest, reply: HttpResponse) => {
    return reply.send({ success: true, orders: [] });
  });

  // POST /v1/orders
  app.post('/v1/orders', async (req: HttpRequest, reply: HttpResponse) => {
    const payload = createOrderSchema.parse(req.body);
    return reply.status(201).send({ success: true, orderId: 'ord_98765', payload });
  });

  // DELETE /v1/orders/:id
  app.delete('/v1/orders/:id', async (req: HttpRequest, reply: HttpResponse) => {
    return reply.status(204).send();
  });
};`;

export default function DashboardPage() {
  // Database Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);

  // Workspace Code state (EMPTY by default - NO mock data unless imported)
  const [codeContent, setCodeContent] = useState<string>('');
  const [loadedFileName, setLoadedFileName] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<DetectedRoute | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedLineRange, setSelectedLineRange] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active drawer (progressive disclosure: clicking a button reveals the drawer)
  const [activeDrawer, setActiveDrawer] = useState<'review' | 'fixes' | 'commit' | 'safety' | 'history' | null>(null);

  // Modals state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importTab, setImportTab] = useState<'github' | 'upload' | 'paste'>('github');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [githubBranch, setGithubBranch] = useState<string>('main');
  const [githubPath, setGithubPath] = useState<string>('openapi.yaml');
  const [isImportingGithub, setIsImportingGithub] = useState<boolean>(false);
  const [githubImportError, setGithubImportError] = useState<string | null>(null);
  const [pasteInput, setPasteInput] = useState<string>('');

  // New Project modal state
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectRepo, setNewProjectRepo] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);

  // Results State
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewResult, setReviewResult] = useState<StudioCodeReview | null>(null);
  const [isGeneratingFix, setIsGeneratingFix] = useState<boolean>(false);
  const [fixResult, setFixResult] = useState<StudioCodeFix | null>(null);
  const [isGeneratingCommitMsg, setIsGeneratingCommitMsg] = useState<boolean>(false);
  const [commitMsgResult, setCommitMsgResult] = useState<StudioCommitMessage | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Fetch Real Projects from MongoDB
  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      try {
        const res = await api.getProjects();
        if (mounted && Array.isArray(res)) {
          setProjects(res);
          if (res.length > 0 && !selectedProjectId) {
            setSelectedProjectId(res[0]._id || res[0].id || '');
          }
        }
      } catch {
        // Fallback or empty if not yet seeded
      } finally {
        if (mounted) setIsLoadingProjects(false);
      }
    }
    loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch recent runs for active project
  useEffect(() => {
    if (!selectedProjectId) return;
    let mounted = true;
    api.getRuns(selectedProjectId, { limit: 5 })
      .then((runs) => {
        if (mounted && Array.isArray(runs)) {
          setRecentRuns(runs);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [selectedProjectId]);

  // 2. Client-side & Server-assisted Route Extraction
  const detectedRoutes = useMemo<DetectedRoute[]>(() => {
    if (!codeContent.trim()) return [];

    const routes: DetectedRoute[] = [];

    // Check if OpenAPI YAML/JSON
    if (codeContent.includes('paths:') || codeContent.includes('"paths"')) {
      const lines = codeContent.split('\n');
      let currentPath = '';
      let inPaths = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^paths:/) || line.includes('"paths":')) {
          inPaths = true;
          continue;
        }

        if (inPaths) {
          // Detect path e.g. "  /api/v1/orders:"
          const pathMatch = line.match(/^\s{2,4}(\/[a-zA-Z0-9_{\}\/-]+):/);
          if (pathMatch) {
            currentPath = pathMatch[1];
            continue;
          }

          // Detect HTTP Method under path
          const methodMatch = line.match(/^\s{4,6}(get|post|put|delete|patch|options|head):/i);
          if (methodMatch && currentPath) {
            const method = methodMatch[1].toUpperCase() as DetectedRoute['method'];
            // Look ahead for summary
            let summary = '';
            for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
              const summaryMatch = lines[j].match(/summary:\s*['"]?([^'"]+)['"]?/);
              if (summaryMatch) {
                summary = summaryMatch[1].trim();
                break;
              }
            }
            routes.push({
              path: currentPath,
              method,
              summary: summary || `${method} ${currentPath}`,
              line: i + 1,
            });
          }
        }
      }
    }

    // Check if TypeScript / Express / Fastify / Next.js route file
    const expressRegex = /(app|router|fastify)\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/gi;
    let match;
    while ((match = expressRegex.exec(codeContent)) !== null) {
      const method = match[2].toUpperCase() as DetectedRoute['method'];
      const path = match[3];
      if (!routes.some((r) => r.path === path && r.method === method)) {
        routes.push({
          path,
          method,
          summary: `${method} handler for ${path}`,
        });
      }
    }

    return routes;
  }, [codeContent]);

  // Filtered routes by search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return detectedRoutes;
    const q = searchQuery.toLowerCase();
    return detectedRoutes.filter(
      (r) => r.path.toLowerCase().includes(q) || r.method.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q)
    );
  }, [detectedRoutes, searchQuery]);

  // Handle Text Selection in Code Editor
  const handleSelectCode = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    if (start !== end) {
      const selected = codeContent.substring(start, end);
      setSelectedText(selected);
      const textBefore = codeContent.substring(0, start);
      const startLine = textBefore.split('\n').length;
      const endLine = startLine + selected.split('\n').length - 1;
      setSelectedLineRange(`L${startLine} - L${endLine}`);
    } else {
      setSelectedText('');
      setSelectedLineRange('');
    }
  };

  // Jump to / select a route
  const handleRouteClick = (route: DetectedRoute) => {
    setSelectedRoute(route);
    // Find route in text if possible
    if (textareaRef.current) {
      const idx = codeContent.indexOf(route.path);
      if (idx !== -1) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(idx, idx + route.path.length);
      }
    }
  };

  // Trigger Code Review
  const handleRunReview = async () => {
    setIsReviewing(true);
    setActiveDrawer('review');
    try {
      const res = await api.reviewStudioCode({
        code: selectedText || codeContent,
        selection: selectedText || undefined,
        language: loadedFileName.endsWith('.ts') ? 'typescript' : 'yaml',
        filePath: loadedFileName || 'spec.yaml',
        projectName: projects.find((p) => (p._id || p.id) === selectedProjectId)?.name || 'Custom Workspace',
      });
      setReviewResult(res);
    } catch {
      // Fallback handled in API
    } finally {
      setIsReviewing(false);
    }
  };

  // Trigger Code Fixes
  const handleRunFixes = async () => {
    setIsGeneratingFix(true);
    setActiveDrawer('fixes');
    try {
      const res = await api.getStudioCodeFixes({
        code: selectedText || codeContent,
        issues: reviewResult?.issues.map((i) => i.title),
        endpoint: selectedRoute?.path || detectedRoutes[0]?.path || '/api/v1/orders',
      });
      setFixResult(res);
    } finally {
      setIsGeneratingFix(false);
    }
  };

  // Trigger Commit Message Optimization
  const handleRunCommitMsg = async () => {
    setIsGeneratingCommitMsg(true);
    setActiveDrawer('commit');
    try {
      const res = await api.getStudioCommitMessage({
        diff: fixResult?.diff || codeContent.slice(0, 800),
        code: codeContent.slice(0, 800),
        context: selectedRoute ? `Endpoint: ${selectedRoute.method} ${selectedRoute.path}` : 'API contract updates',
        branch: 'main',
      });
      setCommitMsgResult(res);
    } finally {
      setIsGeneratingCommitMsg(false);
    }
  };

  // Apply fix to editor
  const handleApplyFix = (newCode: string) => {
    setCodeContent(newCode);
    setCopiedKey('applied');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Import from GitHub Real Fetcher
  const handleImportFromGithub = async () => {
    if (!githubUrl.trim()) return;
    setIsImportingGithub(true);
    setGithubImportError(null);

    try {
      // Parse owner/repo
      let cleanUrl = githubUrl.trim().replace(/\/$/, '');
      cleanUrl = cleanUrl.replace(/^https?:\/\/github\.com\//, '');
      const parts = cleanUrl.split('/');
      if (parts.length < 2) {
        throw new Error('Please enter a valid GitHub repository in "owner/repo" or full URL format.');
      }
      const owner = parts[0];
      const repo = parts[1];
      const branch = githubBranch.trim() || 'main';

      // Candidates to try
      const candidates = [
        githubPath.trim(),
        'openapi.yaml',
        'openapi.json',
        'openapi.yml',
        'swagger.yaml',
        'swagger.json',
        'src/routes.ts',
        'src/index.ts',
        'routes.ts',
      ].filter(Boolean);

      let fetchedContent = '';
      let successfulFile = '';

      for (const file of candidates) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file}`;
        try {
          const res = await fetch(rawUrl);
          if (res.ok) {
            const text = await res.text();
            if (text && !text.includes('404: Not Found')) {
              fetchedContent = text;
              successfulFile = file;
              break;
            }
          }
        } catch {
          // Continue to next candidate
        }
      }

      if (!fetchedContent) {
        throw new Error(
          `Could not locate a service spec or route file in ${owner}/${repo} on branch "${branch}". Please verify the repository is public and contains a valid specification or route file, or specify the exact file path.`
        );
      }

      setCodeContent(fetchedContent);
      setLoadedFileName(successfulFile);
      setShowImportModal(false);
      setGithubUrl('');
      setSelectedRoute(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import from GitHub.';
      setGithubImportError(msg);
    } finally {
      setIsImportingGithub(false);
    }
  };

  // Handle direct file upload from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) {
          setCodeContent(text);
          setLoadedFileName(file.name);
          setShowImportModal(false);
          setSelectedRoute(null);
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle create real project in DB
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsCreatingProject(true);
    try {
      const created = await api.createProject({
        name: newProjectName.trim(),
        repositoryUrl: newProjectRepo.trim() || 'https://github.com/shaktiq/api',
        defaultBranch: 'main',
      });
      setProjects((prev) => [created, ...prev]);
      setSelectedProjectId(created._id || created.id || '');
      setShowNewProjectModal(false);
      setNewProjectName('');
      setNewProjectRepo('');
    } catch {
      // Error handled
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Reset workspace
  const handleClearWorkspace = () => {
    setCodeContent('');
    setLoadedFileName('');
    setSelectedRoute(null);
    setSelectedText('');
    setReviewResult(null);
    setFixResult(null);
    setCommitMsgResult(null);
    setActiveDrawer(null);
  };

  return (
    <div className="space-y-4 text-green-dark">
      {/* 1. TOP TOOLBAR: Consistent Green & Butter Navigation */}
      <div className="bg-white rounded-xl border border-border p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Active Project Selector & Import Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-green-mid uppercase tracking-wider">
              Project:
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-butter-panel border border-border text-xs rounded-lg px-3 py-1.5 font-semibold text-green-dark focus:outline-none focus:ring-1 focus:ring-green-mid"
            >
              {projects.length > 0 ? (
                projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))
              ) : (
                <option value="">Custom Workspace</option>
              )}
            </select>
            <button
              onClick={() => setShowNewProjectModal(true)}
              title="Create New Project"
              className="p-1.5 rounded-lg border border-border bg-butter-panel hover:bg-butter-warm text-green-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* Action: Connect GitHub */}
          <button
            onClick={() => {
              setImportTab('github');
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-dark text-butter-cream hover:bg-green-deep transition-all shadow-xs"
          >
            <Github className="w-3.5 h-3.5 text-butter-gold" />
            <span>Connect GitHub</span>
          </button>

          {/* Action: Upload / Add Code */}
          <button
            onClick={() => {
              setImportTab('upload');
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-butter-panel border border-border hover:bg-butter-warm text-green-dark transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-green-mid" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => {
              setImportTab('paste');
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-butter-panel border border-border hover:bg-butter-warm text-green-dark transition-colors shadow-xs"
          >
            <Code2 className="w-3.5 h-3.5 text-green-mid" />
            <span>Paste Code</span>
          </button>
        </div>

        {/* Right: Reset Action */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {codeContent && (
            <button
              onClick={handleClearWorkspace}
              title="Clear workspace"
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-green-dark px-2 py-1 rounded hover:bg-butter-panel transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN WORKSPACE VIEW */}
      {!codeContent ? (
        /* ================= EMPTY STATE / IMPORT ONBOARDING ================= */
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 shadow-xs text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#0C382E] text-butter-cream mx-auto flex items-center justify-center shadow-md">
              <FolderTree className="w-6 h-6 text-butter-gold" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-green-dark">
              API Release & Contract Studio
            </h2>
          </div>

          {/* Two Hero Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left max-w-2xl mx-auto">
            {/* Card 1: Connect GitHub */}
            <div
              onClick={() => {
                setImportTab('github');
                setShowImportModal(true);
              }}
              className="group p-6 rounded-xl border-2 border-dashed border-border hover:border-green-dark/40 bg-butter-panel hover:bg-butter-warm/40 cursor-pointer transition-all space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-green-dark text-butter-cream flex items-center justify-center shadow-xs">
                <Github className="w-5 h-5 text-butter-gold" />
              </div>
              <h3 className="text-base font-bold text-green-dark group-hover:text-green-mid">
                Connect GitHub & Import Repo
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-mid group-hover:underline pt-1">
                Import from GitHub &rarr;
              </span>
            </div>

            {/* Card 2: Upload or Paste Code */}
            <div
              onClick={() => {
                setImportTab('upload');
                setShowImportModal(true);
              }}
              className="group p-6 rounded-xl border-2 border-dashed border-border hover:border-green-dark/40 bg-butter-panel hover:bg-butter-warm/40 cursor-pointer transition-all space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-green-mid text-butter-cream flex items-center justify-center shadow-xs">
                <Upload className="w-5 h-5 text-butter-gold" />
              </div>
              <h3 className="text-base font-bold text-green-dark group-hover:text-green-mid">
                Upload or Paste Your Code
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-mid group-hover:underline pt-1">
                Upload file or paste &rarr;
              </span>
            </div>
          </div>

          {/* Quick Demo Option */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setCodeContent(PRESET_OPENAPI);
                setLoadedFileName('openapi.yaml');
              }}
              className="text-xs font-bold text-green-dark hover:underline"
            >
              Load Sample Service Spec
            </button>
            <span className="text-border">•</span>
            <button
              onClick={() => {
                setCodeContent(PRESET_CONTROLLER);
                setLoadedFileName('order-controller.ts');
              }}
              className="text-xs font-bold text-green-dark hover:underline"
            >
              Load Sample Route Controller
            </button>
          </div>
        </div>
      ) : (
        /* ================= ACTIVE STUDIO WORKSPACE ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start animate-fade-in">
          {/* ================= LEFT ROUTING NAVIGATOR (Col 4) ================= */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-border p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-green-mid" />
                <span className="text-xs font-bold text-green-dark uppercase tracking-wider">
                  Routing Navigator
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-butter-panel text-green-dark border border-border">
                {detectedRoutes.length} Routes
              </span>
            </div>

            {/* Route Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-butter-panel border border-border text-xs text-green-dark focus:outline-none focus:ring-1 focus:ring-green-mid placeholder:text-text-muted"
              />
            </div>

            {/* Detected Endpoints List */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredRoutes.length === 0 ? (
                <div className="text-xs text-text-muted p-4 text-center bg-butter-panel rounded-lg border border-border/40">
                  No routes detected in active file.
                </div>
              ) : (
                filteredRoutes.map((r, i) => {
                  const isSelected = selectedRoute?.path === r.path && selectedRoute?.method === r.method;

                  // Method badge style
                  const methodStyle =
                    r.method === 'GET'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : r.method === 'POST'
                      ? 'bg-emerald-700 text-butter-cream border-emerald-800'
                      : r.method === 'PUT'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : r.method === 'DELETE'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-purple-100 text-purple-900 border-purple-300';

                  return (
                    <div
                      key={`${r.method}-${r.path}-${i}`}
                      onClick={() => handleRouteClick(r)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-butter-cream/60 border-green-dark/40 ring-1 ring-green-mid/30 shadow-xs'
                          : 'bg-butter-panel hover:bg-butter-warm/40 border-border/80'
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border font-mono ${methodStyle}`}>
                            {r.method}
                          </span>
                          <span className="text-xs font-bold text-green-dark truncate font-mono">
                            {r.path}
                          </span>
                        </div>
                        {r.summary && (
                          <p className="text-[11px] text-text-muted truncate pl-0.5">
                            {r.summary}
                          </p>
                        )}
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 mt-1 flex-shrink-0 transition-opacity ${
                        isSelected ? 'text-green-dark opacity-100' : 'text-text-muted opacity-40'
                      }`} />
                    </div>
                  );
                })
              )}
            </div>

            {/* Loaded File Info Card */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-4 h-4 text-green-mid flex-shrink-0" />
                <span className="font-semibold text-green-dark truncate">
                  {loadedFileName || 'custom-spec.yaml'}
                </span>
              </div>
              <span className="text-[11px] font-mono">
                {codeContent.split('\n').length} lines
              </span>
            </div>
          </div>

          {/* ================= CENTER / RIGHT: CODE EDITOR & BUTTON ACTION BAR (Col 8) ================= */}
          <div className="lg:col-span-8 space-y-3">
            {/* Top Action Toolbar (Button-Based Disclosure) */}
            <div className="bg-white rounded-xl border border-border p-3 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
              {/* Active Scope Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-green-dark">Scope:</span>
                {selectedRoute ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-butter-cream border border-butter-gold text-green-dark text-xs font-mono font-semibold">
                    <span>{selectedRoute.method} {selectedRoute.path}</span>
                    <button
                      onClick={() => setSelectedRoute(null)}
                      title="Clear route filter"
                      className="hover:text-rose-600 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted bg-butter-panel border border-border px-2.5 py-1 rounded-md">
                    Entire File ({detectedRoutes.length} routes)
                  </span>
                )}
                {selectedLineRange && (
                  <span className="text-[11px] text-green-mid font-mono bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    {selectedLineRange}
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS (Clicking reveals results in drawer) */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRunReview}
                  disabled={isReviewing}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    activeDrawer === 'review'
                      ? 'bg-green-dark text-butter-cream ring-2 ring-emerald-500'
                      : 'bg-green-dark text-butter-cream hover:bg-green-deep'
                  }`}
                >
                  <Search className={`w-3.5 h-3.5 text-butter-gold ${isReviewing ? 'animate-spin' : ''}`} />
                  <span>{isReviewing ? 'Auditing...' : 'Review Code'}</span>
                </button>

                <button
                  onClick={handleRunFixes}
                  disabled={isGeneratingFix}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    activeDrawer === 'fixes'
                      ? 'bg-green-mid text-butter-cream ring-2 ring-emerald-500'
                      : 'bg-butter-panel border border-border text-green-dark hover:bg-butter-warm'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-green-mid" />
                  <span>Suggest Fixes</span>
                </button>

                <button
                  onClick={handleRunCommitMsg}
                  disabled={isGeneratingCommitMsg}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    activeDrawer === 'commit'
                      ? 'bg-green-mid text-butter-cream ring-2 ring-emerald-500'
                      : 'bg-butter-panel border border-border text-green-dark hover:bg-butter-warm'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5 text-green-mid" />
                  <span>Commit Msg</span>
                </button>

                <button
                  onClick={() => setActiveDrawer(activeDrawer === 'safety' ? null : 'safety')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    activeDrawer === 'safety'
                      ? 'bg-green-mid text-butter-cream ring-2 ring-emerald-500'
                      : 'bg-butter-panel border border-border text-green-dark hover:bg-butter-warm'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-green-mid" />
                  <span>Safety Verdict</span>
                </button>

                <button
                  onClick={() => setActiveDrawer(activeDrawer === 'history' ? null : 'history')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    activeDrawer === 'history'
                      ? 'bg-green-mid text-butter-cream ring-2 ring-emerald-500'
                      : 'bg-butter-panel border border-border text-green-dark hover:bg-butter-warm'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-green-mid" />
                  <span>History</span>
                </button>
              </div>
            </div>

            {/* Split Grid when Drawer is Open vs Full Width Editor */}
            <div className="grid grid-cols-1 gap-4 items-start">
              {/* THE CODE EDITOR: Simple White / Butter Background */}
              <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
                <div className="bg-butter-panel px-4 py-2.5 border-b border-border flex items-center justify-between text-xs text-green-dark">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-mono font-bold text-green-dark">{loadedFileName || 'spec.yaml'}</span>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {selectedText ? `${selectedLineRange} selected` : 'Select code with mouse to audit specific lines'}
                  </span>
                </div>

                <div className="p-3 bg-white">
                  <textarea
                    ref={textareaRef}
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    onSelect={handleSelectCode}
                    rows={22}
                    spellCheck={false}
                    className="w-full bg-[#FFFDF7] text-green-dark font-mono text-xs leading-6 p-3.5 focus:outline-none resize-y selection:bg-butter-gold/60 border border-border/50 rounded-lg shadow-inner"
                  />
                </div>
              </div>

              {/* ================= PROGRESSIVE DISCLOSURE SLIDE-OVER PANELS ================= */}
              {activeDrawer && (
                <div className="bg-white rounded-xl border border-border p-5 shadow-lg space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      {activeDrawer === 'review' && <Search className="w-5 h-5 text-green-dark" />}
                      {activeDrawer === 'fixes' && <Wrench className="w-5 h-5 text-green-mid" />}
                      {activeDrawer === 'commit' && <GitCommit className="w-5 h-5 text-green-mid" />}
                      {activeDrawer === 'safety' && <Shield className="w-5 h-5 text-green-dark" />}
                      {activeDrawer === 'history' && <History className="w-5 h-5 text-green-mid" />}
                      <h3 className="text-base font-extrabold text-green-dark">
                        {activeDrawer === 'review' && 'AI Code Review & Compatibility Audit'}
                        {activeDrawer === 'fixes' && 'Backward-Compatible Fixes & Patch'}
                        {activeDrawer === 'commit' && 'Conventional Commit Message Optimizer'}
                        {activeDrawer === 'safety' && 'Release Safety & Breaking Change Analysis'}
                        {activeDrawer === 'history' && 'Past Runs & Verdict History'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveDrawer(null)}
                      className="p-1 rounded-lg hover:bg-butter-panel text-text-muted hover:text-green-dark"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* DRAWER 1: CODE REVIEW */}
                  {activeDrawer === 'review' && (
                    <div className="space-y-4">
                      {isReviewing ? (
                        <div className="p-8 text-center space-y-3 bg-butter-panel rounded-xl">
                          <RefreshCw className="w-6 h-6 animate-spin text-green-mid mx-auto" />
                          <p className="text-xs font-semibold text-green-dark">Analyzing route schema contracts with AI...</p>
                        </div>
                      ) : reviewResult ? (
                        <div className="space-y-4">
                          {/* Verdict Box */}
                          <div className={`p-4 rounded-xl border flex items-center justify-between ${
                            reviewResult.verdict === 'SAFE'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : reviewResult.verdict === 'WARNING'
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-rose-50 border-rose-300 text-rose-900'
                          }`}>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                                Compatibility Verdict
                              </div>
                              <div className="text-base font-extrabold">{reviewResult.verdict}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black">{reviewResult.score}/100</div>
                              <div className="text-[10px] opacity-75">Safety Score</div>
                            </div>
                          </div>

                          <p className="text-xs text-green-dark bg-butter-panel p-3 rounded-lg border border-border">
                            {reviewResult.summary}
                          </p>

                          {/* Issues List */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-green-dark uppercase tracking-wider">
                              Audit Findings ({reviewResult.issues.length})
                            </span>
                            {reviewResult.issues.length === 0 ? (
                              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                                <span>All endpoint schemas and route parameters are backward-compatible.</span>
                              </div>
                            ) : (
                              reviewResult.issues.map((issue, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-butter-panel border border-border space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-green-dark">{issue.title}</span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                      issue.severity === 'critical'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : issue.severity === 'warning'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}>
                                      {issue.severity}
                                    </span>
                                  </div>
                                  <p className="text-xs text-text-muted">{issue.description}</p>
                                  <div className="text-xs text-green-dark bg-emerald-50 border border-emerald-200 p-2 rounded font-mono">
                                    Fix: {issue.suggestion}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-text-muted bg-butter-panel rounded-xl">
                          Click &quot;Review Code&quot; to inspect your routes.
                        </div>
                      )}
                    </div>
                  )}

                  {/* DRAWER 2: CODE FIXES */}
                  {activeDrawer === 'fixes' && (
                    <div className="space-y-4">
                      {isGeneratingFix ? (
                        <div className="p-8 text-center space-y-3 bg-butter-panel rounded-xl">
                          <RefreshCw className="w-6 h-6 animate-spin text-green-mid mx-auto" />
                          <p className="text-xs font-semibold text-green-dark">Generating backward-compatible patch...</p>
                        </div>
                      ) : fixResult ? (
                        <div className="space-y-3">
                          <p className="text-xs text-green-dark bg-butter-panel p-3 rounded-lg border border-border">
                            {fixResult.explanation}
                          </p>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-green-dark uppercase tracking-wider">
                                Suggested Diff
                              </span>
                              <button
                                onClick={() => handleCopy(fixResult.fixedSnippet, 'fixed')}
                                className="text-xs text-green-mid font-semibold hover:underline flex items-center gap-1"
                              >
                                {copiedKey === 'fixed' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                Copy Code
                              </button>
                            </div>
                            <pre className="p-3 rounded-lg bg-[#FFFDF7] text-green-dark text-xs font-mono overflow-x-auto max-h-56 leading-5 border border-border shadow-xs">
                              {fixResult.diff}
                            </pre>
                          </div>

                          <button
                            onClick={() => handleApplyFix(fixResult.fixedSnippet)}
                            className="w-full py-2.5 rounded-xl bg-green-dark text-butter-cream font-bold text-xs hover:bg-green-deep transition-all shadow-xs flex items-center justify-center gap-2"
                          >
                            {copiedKey === 'applied' ? (
                              <>
                                <CheckCheck className="w-4 h-4 text-emerald-400" />
                                <span>Applied to Editor!</span>
                              </>
                            ) : (
                              <>
                                <Wrench className="w-4 h-4 text-butter-gold" />
                                <span>Apply Fix Directly to Editor</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-text-muted bg-butter-panel rounded-xl">
                          Click &quot;Suggest Fixes&quot; to auto-generate backward-compatible remediation code.
                        </div>
                      )}
                    </div>
                  )}

                  {/* DRAWER 3: COMMIT MESSAGE */}
                  {activeDrawer === 'commit' && (
                    <div className="space-y-4">
                      {isGeneratingCommitMsg ? (
                        <div className="p-8 text-center space-y-3 bg-butter-panel rounded-xl">
                          <RefreshCw className="w-6 h-6 animate-spin text-green-mid mx-auto" />
                          <p className="text-xs font-semibold text-green-dark">Formulating conventional commit message...</p>
                        </div>
                      ) : commitMsgResult ? (
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-lg bg-[#FFFDF7] border border-border space-y-2 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-green-dark uppercase tracking-wider">
                                Conventional Commit
                              </span>
                              <button
                                onClick={() => handleCopy(commitMsgResult.conventionalMessage, 'commit-msg')}
                                className="text-xs text-green-mid font-semibold hover:underline flex items-center gap-1"
                              >
                                {copiedKey === 'commit-msg' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                Copy
                              </button>
                            </div>
                            <p className="text-xs font-mono text-green-dark font-bold">
                              {commitMsgResult.title}
                            </p>
                            {commitMsgResult.body && (
                              <p className="text-xs font-mono text-text-muted whitespace-pre-wrap leading-relaxed">
                                {commitMsgResult.body}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-green-dark uppercase tracking-wider">
                              Alternative Commit Titles
                            </span>
                            <div className="space-y-1">
                              {commitMsgResult.alternativeSuggestions.map((alt, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleCopy(alt, `alt-${idx}`)}
                                  className="p-2 rounded-lg bg-butter-panel hover:bg-butter-warm border border-border text-xs font-mono text-green-dark cursor-pointer flex items-center justify-between"
                                >
                                  <span>{alt}</span>
                                  {copiedKey === `alt-${idx}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-text-muted" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-text-muted bg-butter-panel rounded-xl">
                          Click &quot;Commit Msg&quot; to synthesize semantic conventional commit messages.
                        </div>
                      )}
                    </div>
                  )}

                  {/* DRAWER 4: SAFETY VERDICT */}
                  {activeDrawer === 'safety' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-butter-panel rounded-lg border border-border">
                          <div className="text-xl font-bold text-green-dark">{detectedRoutes.length}</div>
                          <div className="text-[11px] text-text-muted">Total Routes</div>
                        </div>
                        <div className="p-3 bg-butter-panel rounded-lg border border-border">
                          <div className="text-xl font-bold text-rose-600">
                            {reviewResult?.issues.filter((i) => i.severity === 'critical').length ?? 0}
                          </div>
                          <div className="text-[11px] text-text-muted">Breaking Issues</div>
                        </div>
                        <div className="p-3 bg-butter-panel rounded-lg border border-border">
                          <div className="text-xl font-bold text-amber-600">
                            {reviewResult?.issues.filter((i) => i.severity === 'warning').length ?? 0}
                          </div>
                          <div className="text-[11px] text-text-muted">Warnings</div>
                        </div>
                      </div>
                      <div className="p-3 bg-butter-panel rounded-lg border border-border text-xs text-green-dark leading-relaxed">
                        API contracts are checked against breaking REST guidelines: mandatory new fields without defaults, parameter deletion, and modified response types.
                      </div>
                    </div>
                  )}

                  {/* DRAWER 5: HISTORY */}
                  {activeDrawer === 'history' && (
                    <div className="space-y-2">
                      {recentRuns.length === 0 ? (
                        <div className="p-6 text-center text-xs text-text-muted bg-butter-panel rounded-xl">
                          No past runs recorded for this project yet.
                        </div>
                      ) : (
                        recentRuns.map((r) => (
                          <div key={r._id || r.id} className="p-3 rounded-lg bg-butter-panel border border-border flex items-center justify-between text-xs">
                            <div>
                              <div className="font-mono font-bold text-green-dark">
                                {r.headSha ? r.headSha.slice(0, 7) : 'HEAD'} • {r.headBranch || 'main'}
                              </div>
                              <div className="text-[11px] text-text-muted">
                                {new Date(r.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              r.releaseStatus === 'safe'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.releaseStatus === 'review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.releaseStatus || 'Completed'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL: CONNECT GITHUB / UPLOAD CODE */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-green-dark" />
                <h3 className="text-base font-bold text-green-dark">
                  {importTab === 'github' ? 'Import from GitHub' : importTab === 'upload' ? 'Upload Code File' : 'Paste Code'}
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg hover:bg-butter-panel text-text-muted hover:text-green-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab selector */}
            <div className="flex rounded-lg bg-butter-panel p-1 border border-border text-xs font-semibold">
              <button
                onClick={() => setImportTab('github')}
                className={`flex-1 py-1.5 rounded-md transition-all ${
                  importTab === 'github' ? 'bg-green-dark text-butter-cream shadow-xs' : 'text-text-muted hover:text-green-dark'
                }`}
              >
                GitHub Repo
              </button>
              <button
                onClick={() => setImportTab('upload')}
                className={`flex-1 py-1.5 rounded-md transition-all ${
                  importTab === 'upload' ? 'bg-green-dark text-butter-cream shadow-xs' : 'text-text-muted hover:text-green-dark'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setImportTab('paste')}
                className={`flex-1 py-1.5 rounded-md transition-all ${
                  importTab === 'paste' ? 'bg-green-dark text-butter-cream shadow-xs' : 'text-text-muted hover:text-green-dark'
                }`}
              >
                Paste Code
              </button>
            </div>

            {/* TAB: GITHUB */}
            {importTab === 'github' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-green-dark">GitHub Repository</label>
                  <input
                    type="text"
                    placeholder="e.g. subratoghosh/uncharted_shakti_1 or https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-butter-panel border border-border text-xs text-green-dark focus:ring-1 focus:ring-green-mid"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-green-dark">Branch</label>
                    <input
                      type="text"
                      placeholder="main"
                      value={githubBranch}
                      onChange={(e) => setGithubBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-butter-panel border border-border text-xs text-green-dark focus:ring-1 focus:ring-green-mid"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-green-dark">Spec / Route Path</label>
                    <input
                      type="text"
                      placeholder="service-spec.yaml (or auto-detect)"
                      value={githubPath}
                      onChange={(e) => setGithubPath(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-butter-panel border border-border text-xs text-green-dark focus:ring-1 focus:ring-green-mid"
                    />
                  </div>
                </div>

                {/* OpenAPI & Spec Guidance Card */}
                <OpenApiGuidanceCard compact />

                {githubImportError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {githubImportError}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-butter-panel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportFromGithub}
                    disabled={isImportingGithub || !githubUrl.trim()}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-green-dark text-butter-cream hover:bg-green-deep transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isImportingGithub ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <span>Import Repository</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB: UPLOAD FILE */}
            {importTab === 'upload' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-green-dark">Select Service Spec or Route file</label>
                <div className="relative border-2 border-dashed border-border hover:border-green-dark/50 rounded-xl p-8 text-center space-y-2 bg-butter-panel/60 cursor-pointer transition-all">
                  <Upload className="w-7 h-7 text-green-mid mx-auto" />
                  <p className="text-xs font-bold text-green-dark">Click or drag file here to upload</p>
                  <p className="text-[11px] text-text-muted">Supports .yaml, .yml, .json, .ts, .js</p>
                  <input
                    type="file"
                    accept=".yaml,.yml,.json,.ts,.js,.py"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB: PASTE CODE */}
            {importTab === 'paste' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-green-dark">Paste Service Spec or Route Code</label>
                <textarea
                  rows={8}
                  placeholder="paths:&#10;  /users:&#10;    get:&#10;      summary: ..."
                  value={pasteInput}
                  onChange={(e) => setPasteInput(e.target.value)}
                  className="w-full p-3 rounded-lg bg-butter-panel border border-border text-xs font-mono text-green-dark focus:ring-1 focus:ring-green-mid"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-butter-panel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (pasteInput.trim()) {
                        setCodeContent(pasteInput);
                        setLoadedFileName('pasted-code.yaml');
                        setShowImportModal(false);
                        setPasteInput('');
                        setSelectedRoute(null);
                      }
                    }}
                    disabled={!pasteInput.trim()}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-green-dark text-butter-cream hover:bg-green-deep shadow-xs disabled:opacity-50"
                  >
                    Load into Studio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL: CREATE NEW PROJECT IN DB */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-green-dark">Create Project in Database</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="p-1 rounded-lg hover:bg-butter-panel text-text-muted hover:text-green-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-green-dark">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Orders & Checkout Service"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-butter-panel border border-border text-xs text-green-dark focus:ring-1 focus:ring-green-mid"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-green-dark">Repository URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://github.com/myorg/api"
                  value={newProjectRepo}
                  onChange={(e) => setNewProjectRepo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-butter-panel border border-border text-xs text-green-dark focus:ring-1 focus:ring-green-mid"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-butter-panel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={isCreatingProject || !newProjectName.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-green-dark text-butter-cream hover:bg-green-deep shadow-xs disabled:opacity-50"
                >
                  {isCreatingProject ? 'Saving...' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
