'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Code2,
  GitBranch,
  Github,
  Upload,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  GitCommit,
  History,
  Wrench,
  Search,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  FileCode,
  X,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { api } from '@/lib/api';
import type {
  Project,
  Run,
  DetectedRoute,
  StudioCodeReview,
  StudioCommitMessage,
  StudioCodeFix,
  StudioCommitLog,
} from '@/types/index';

// Default presets for instant exploration
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

const PRESET_CONTROLLER = `import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const createOrderSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(z.object({
    sku: z.string(),
    quantity: z.number().int().positive(),
  })),
  totalAmount: z.number().positive(),
  // New field added in v2.1 without default value
  priorityShipping: z.boolean(),
});

export async function orderRoutes(app: FastifyInstance) {
  // GET /api/v1/orders
  app.get('/api/v1/orders', async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ success: true, orders: [] });
  });

  // POST /api/v1/orders
  app.post('/api/v1/orders', async (req: FastifyRequest, reply: FastifyReply) => {
    const payload = createOrderSchema.parse(req.body);
    return reply.status(201).send({ success: true, orderId: 'ord_98765', payload });
  });

  // DELETE /api/v1/orders/:id
  app.delete('/api/v1/orders/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    // Notice: Missing Deprecation header for legacy clients
    return reply.status(204).send();
  });
}`;

const MOCK_COMMITS: StudioCommitLog[] = [
  {
    sha: '9c23205',
    message: 'merge: integrate origin/vicky/main n8n launcher scripts and robust env loading',
    author: 'Subrato Ghosh',
    date: '10 minutes ago',
    filesChanged: 4,
    insertions: 54,
    deletions: 8,
  },
  {
    sha: '3683fa3',
    message: 'fix(deps): remove platform-specific darwin-arm64 SWC dependency causing Vercel EBADPLATFORM',
    author: 'Subrato Ghosh',
    date: '35 minutes ago',
    filesChanged: 2,
    insertions: 0,
    deletions: 18,
  },
  {
    sha: 'cd7f2ee',
    message: 'chore(branding): update layout metadata and favicon paths with transparent emblem',
    author: 'Subrato Ghosh',
    date: '1 hour ago',
    filesChanged: 3,
    insertions: 12,
    deletions: 4,
  },
  {
    sha: 'c1a697e',
    message: 'fix(auth): update userValidator schema to support oauth users and relax strict passwordHash',
    author: 'Subrato Ghosh',
    date: '2 hours ago',
    filesChanged: 2,
    insertions: 8,
    deletions: 2,
  },
];

interface CodeIntelligenceStudioProps {
  projects?: Project[];
  runs?: Run[];
  activeProject?: Project | null;
  onSelectProject?: (project: Project) => void;
}

export function CodeIntelligenceStudio({
  projects = [],
  runs = [],
  activeProject,
  onSelectProject,
}: CodeIntelligenceStudioProps) {
  // Active Project & Code state
  const [selectedFile, setSelectedFile] = useState<'openapi.yaml' | 'order-controller.ts'>('openapi.yaml');
  const [codeContent, setCodeContent] = useState<string>(PRESET_OPENAPI);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedLineRange, setSelectedLineRange] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Right-side Feature Tabs
  const [activeTab, setActiveTab] = useState<'review' | 'fixes' | 'commit-msg' | 'history' | 'previous-runs'>('review');

  // Modals
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importType, setImportType] = useState<'github' | 'upload' | 'paste'>('github');
  const [githubRepoUrl, setGithubRepoUrl] = useState<string>('https://github.com/shaktiq/checkout-service');
  const [githubBranch, setGithubBranch] = useState<string>('main');
  const [uploadText, setUploadText] = useState<string>('');

  // Results State
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewResult, setReviewResult] = useState<StudioCodeReview | null>(null);

  const [isGeneratingFix, setIsGeneratingFix] = useState<boolean>(false);
  const [fixResult, setFixResult] = useState<StudioCodeFix | null>(null);

  const [isGeneratingCommitMsg, setIsGeneratingCommitMsg] = useState<boolean>(false);
  const [commitMsgResult, setCommitMsgResult] = useState<StudioCommitMessage | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Routes detected from current code
  const [detectedRoutes, setDetectedRoutes] = useState<DetectedRoute[]>([
    { path: '/api/v1/orders', method: 'GET', summary: 'List customer orders' },
    { path: '/api/v1/orders', method: 'POST', summary: 'Place a new order' },
    { path: '/api/v1/orders/{id}', method: 'GET', summary: 'Retrieve order by ID' },
    { path: '/api/v1/orders/{id}', method: 'DELETE', summary: 'Cancel existing order' },
    { path: '/api/v1/orders/{id}/refund', method: 'POST', summary: 'Issue customer refund' },
  ]);

  // Code editor ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync route parsing whenever code changes
  useEffect(() => {
    let isMounted = true;
    api.parseStudioRoutes({ content: codeContent, fileType: selectedFile }).then((res) => {
      if (isMounted && res.routes) {
        setDetectedRoutes(res.routes);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [codeContent, selectedFile]);

  // Handle Text Selection in Editor
  const handleSelectCode = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    if (start !== end) {
      const selected = codeContent.substring(start, end);
      setSelectedText(selected);
      // Calculate lines
      const textBefore = codeContent.substring(0, start);
      const textSelected = codeContent.substring(start, end);
      const startLine = textBefore.split('\n').length;
      const endLine = startLine + textSelected.split('\n').length - 1;
      setSelectedLineRange(`L${startLine} - L${endLine}`);
    } else {
      setSelectedText('');
      setSelectedLineRange('');
    }
  };

  // Switch between sample files
  const handleSelectFile = (file: 'openapi.yaml' | 'order-controller.ts') => {
    setSelectedFile(file);
    setSelectedText('');
    setSelectedLineRange('');
    if (file === 'openapi.yaml') {
      setCodeContent(PRESET_OPENAPI);
    } else {
      setCodeContent(PRESET_CONTROLLER);
    }
  };

  // Trigger Review (Selection or Full File)
  const handleRunReview = async (selectionOnly = false) => {
    setIsReviewing(true);
    setActiveTab('review');
    try {
      const res = await api.reviewStudioCode({
        code: codeContent,
        selection: selectionOnly ? selectedText : undefined,
        language: selectedFile.endsWith('.ts') ? 'typescript' : 'yaml',
        filePath: selectedFile,
        projectName: activeProject?.name || 'Checkout Service',
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
    setActiveTab('fixes');
    try {
      const res = await api.getStudioCodeFixes({
        code: selectedText || codeContent,
        issues: reviewResult?.issues.map((i) => i.title),
        endpoint: detectedRoutes[0]?.path || '/api/v1/orders',
      });
      setFixResult(res);
    } finally {
      setIsGeneratingFix(false);
    }
  };

  // Trigger Commit Message Optimization
  const handleRunCommitMsg = async () => {
    setIsGeneratingCommitMsg(true);
    setActiveTab('commit-msg');
    try {
      const res = await api.getStudioCommitMessage({
        code: selectedText || codeContent,
        branch: activeProject?.defaultBranch || 'main',
        context: `Updated ${selectedFile} with backward-compatibility enhancements`,
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

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return detectedRoutes;
    const q = searchQuery.toLowerCase();
    return detectedRoutes.filter(
      (r) => r.path.toLowerCase().includes(q) || r.method.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q)
    );
  }, [detectedRoutes, searchQuery]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. TOP BANNER: Connect GitHub & Import Repo or Upload Code */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-[#061a14] via-[#0A382C] to-[#082820] p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#52B143]/20 text-[#52B143] border border-[#52B143]/30">
                <Sparkles className="w-3 h-3" />
                Live Code Intelligence Studio
              </span>
              <span className="text-xs text-text-muted">
                {activeProject ? `Connected to ${activeProject.fullName || activeProject.name}` : 'GitHub Ready'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-butter-cream tracking-tight">
              Connect Repository, Explore Endpoints & Audit Code
            </h2>
            <p className="text-xs text-butter-cream/70 max-w-2xl">
              Inspect your API routes in real-time, highlight lines for instant AI code review, optimize commit messages, and generate backward-compatible fixes before merging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setImportType('github');
                setShowImportModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-foreground hover:bg-surface-2 transition-all shadow-xs"
            >
              <Github className="w-4 h-4 text-emerald-400" />
              <span>Connect GitHub</span>
            </button>

            <button
              onClick={() => {
                setImportType('upload');
                setShowImportModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-foreground hover:bg-surface-2 transition-all shadow-xs"
            >
              <Upload className="w-4 h-4 text-[#52B143]" />
              <span>Upload Code / Spec</span>
            </button>

            <div className="h-6 w-px bg-emerald-500/20 hidden sm:block" />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-text-muted px-2 font-medium">Presets:</span>
              <button
                onClick={() => handleSelectFile('openapi.yaml')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedFile === 'openapi.yaml'
                    ? 'bg-[#52B143] text-black font-semibold shadow-xs'
                    : 'text-butter-cream/80 hover:text-white'
                }`}
              >
                OpenAPI Spec
              </button>
              <button
                onClick={() => handleSelectFile('order-controller.ts')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedFile === 'order-controller.ts'
                    ? 'bg-[#52B143] text-black font-semibold shadow-xs'
                    : 'text-butter-cream/80 hover:text-white'
                }`}
              >
                TypeScript Controller
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPLIT-PANE WORKSPACE: Left Route Explorer | Center Code Editor | Right Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT RAIL: Route & File Explorer (Col 3) */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-surface p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Route & File Explorer
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
              {detectedRoutes.length} Routes
            </span>
          </div>

          {/* Search Routes */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter routes (/orders, POST)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted/60"
            />
          </div>

          {/* Detected Routes List */}
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider px-1 pb-1">
              Detected Endpoints
            </div>
            {filteredRoutes.length === 0 ? (
              <div className="text-xs text-muted p-3 text-center bg-surface-2/50 rounded-lg">
                No matching endpoints
              </div>
            ) : (
              filteredRoutes.map((r, i) => {
                const methodColor =
                  r.method === 'GET'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : r.method === 'POST'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : r.method === 'PUT'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : r.method === 'DELETE'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

                return (
                  <div
                    key={`${r.method}-${r.path}-${i}`}
                    onClick={() => {
                      // Jump to or filter endpoint code
                      setSelectedText(r.path);
                      setSelectedLineRange(r.method);
                    }}
                    className="p-2 rounded-lg bg-surface-2/60 hover:bg-surface-2 border border-border/60 hover:border-accent/40 cursor-pointer transition-all group flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border font-mono ${methodColor}`}>
                          {r.method}
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate group-hover:text-accent font-mono">
                          {r.path}
                        </span>
                      </div>
                      {r.summary && (
                        <p className="text-[11px] text-muted truncate">{r.summary}</p>
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
                  </div>
                );
              })
            )}
          </div>

          {/* Project Files */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider px-1">
              Active Project Files
            </div>
            <div
              onClick={() => handleSelectFile('openapi.yaml')}
              className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 border text-xs transition-all ${
                selectedFile === 'openapi.yaml'
                  ? 'bg-accent/10 border-accent/40 text-accent font-semibold'
                  : 'bg-surface-2/40 border-border text-foreground hover:bg-surface-2'
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="truncate">openapi.yaml</span>
              <span className="text-[10px] ml-auto text-muted">Spec</span>
            </div>

            <div
              onClick={() => handleSelectFile('order-controller.ts')}
              className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 border text-xs transition-all ${
                selectedFile === 'order-controller.ts'
                  ? 'bg-accent/10 border-accent/40 text-accent font-semibold'
                  : 'bg-surface-2/40 border-border text-foreground hover:bg-surface-2'
              }`}
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="truncate">order-controller.ts</span>
              <span className="text-[10px] ml-auto text-muted">Controller</span>
            </div>
          </div>
        </div>

        {/* CENTER PANE: Interactive Code Viewer / Editor (Col 5) */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-[#081814] text-butter-cream p-4 space-y-3 shadow-md flex flex-col">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                {selectedFile}
              </span>
              {selectedLineRange && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#52B143]/20 text-[#52B143] border border-[#52B143]/30 font-semibold animate-pulse">
                  Selected: {selectedLineRange}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Review Selection button (highlighted when text is selected) */}
              {selectedText ? (
                <button
                  onClick={() => handleRunReview(true)}
                  disabled={isReviewing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#52B143] text-black hover:opacity-90 transition-all shadow-sm animate-scale-in"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Review Selection</span>
                </button>
              ) : null}

              {/* Review Full File */}
              <button
                onClick={() => handleRunReview(false)}
                disabled={isReviewing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-emerald-500/30 text-butter-cream hover:bg-surface-2 transition-all shadow-xs"
              >
                {isReviewing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                )}
                <span>Review Whole File</span>
              </button>

              {/* Copy Code */}
              <button
                onClick={() => handleCopy(codeContent, 'editor-code')}
                className="p-1.5 rounded-lg bg-surface border border-emerald-500/20 text-butter-cream/80 hover:text-white transition-all"
                title="Copy Code"
              >
                {copiedKey === 'editor-code' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Line Numbers + Interactive Textarea */}
          <div className="relative flex rounded-xl border border-emerald-500/20 bg-[#040f0c] overflow-hidden min-h-[460px]">
            {/* Line numbers column */}
            <div className="select-none py-3 px-2 text-right bg-[#030a08] border-r border-emerald-500/10 text-muted/40 font-mono text-xs w-10 flex-shrink-0">
              {codeContent.split('\n').map((_, idx) => (
                <div key={idx} className="leading-5">
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Code Textarea with text selection listener */}
            <textarea
              ref={textareaRef}
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              onSelect={handleSelectCode}
              onKeyUp={handleSelectCode}
              onMouseUp={handleSelectCode}
              spellCheck={false}
              className="flex-1 w-full bg-transparent p-3 font-mono text-xs text-butter-cream focus:outline-none resize-none leading-5 selection:bg-[#52B143]/30 selection:text-white"
              rows={24}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-butter-cream/60 px-1 pt-1">
            <span>Tip: Select any portion of code with your mouse to trigger targeted selection review.</span>
            <span>{codeContent.split('\n').length} lines</span>
          </div>
        </div>

        {/* RIGHT PANE: Interactive Split Tabs & AI Execution Results (Col 4) */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-surface p-4 space-y-4 shadow-xs">
          {/* Action Tabs Header */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('review');
                if (!reviewResult) handleRunReview(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'review'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('fixes');
                if (!fixResult) handleRunFixes();
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'fixes'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Fixes</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('commit-msg');
                if (!commitMsgResult) handleRunCommitMsg();
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'commit-msg'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Commit AI</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('previous-runs')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'previous-runs'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Analyses</span>
            </button>
          </div>

          {/* TAB 1: CODE REVIEW RESULTS */}
          {activeTab === 'review' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Code Review Findings
                </span>
                <button
                  onClick={() => handleRunReview(Boolean(selectedText))}
                  disabled={isReviewing}
                  className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isReviewing ? 'animate-spin' : ''}`} />
                  Re-analyze
                </button>
              </div>

              {isReviewing ? (
                <div className="p-8 text-center space-y-3 bg-surface-2/40 rounded-xl border border-border">
                  <RefreshCw className="w-6 h-6 animate-spin text-accent mx-auto" />
                  <p className="text-xs text-muted">Gemini 3.8 Flash is reviewing contracts & compatibility...</p>
                </div>
              ) : reviewResult ? (
                <div className="space-y-3">
                  {/* Verdict Card */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    reviewResult.verdict === 'SAFE'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : reviewResult.verdict === 'WARNING'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        Compatibility Verdict
                      </div>
                      <div className="text-sm font-extrabold">{reviewResult.verdict}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black">{reviewResult.score}/100</div>
                      <div className="text-[10px] opacity-70">Safety Score</div>
                    </div>
                  </div>

                  <p className="text-xs text-foreground bg-surface-2/60 p-3 rounded-lg border border-border">
                    {reviewResult.summary}
                  </p>

                  {/* Issues */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                      Audit Checks ({reviewResult.issues.length})
                    </span>
                    {reviewResult.issues.length === 0 ? (
                      <div className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg border border-emerald-500/20 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>All schemas and route contracts are backward-compatible.</span>
                      </div>
                    ) : (
                      reviewResult.issues.map((issue, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-surface-2 border border-border space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground">{issue.title}</span>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              issue.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-400'
                                : issue.severity === 'warning'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted">{issue.description}</p>
                          <div className="text-[11px] text-emerald-400 bg-black/40 p-1.5 rounded font-mono">
                            Fix: {issue.suggestion}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="text-[10px] text-muted/60 text-right">
                    Engine: {reviewResult.generatedBy}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-2 bg-surface-2/30 rounded-xl border border-dashed border-border">
                  <Play className="w-5 h-5 text-accent mx-auto" />
                  <p className="text-xs text-foreground font-semibold">Ready for Review</p>
                  <p className="text-[11px] text-muted">
                    Click &quot;Review Whole File&quot; or select code with your mouse to audit for breaking changes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CODE FIXES & REMEDIATION */}
          {activeTab === 'fixes' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Auto-Remediation & Fixes
                </span>
                <button
                  onClick={handleRunFixes}
                  disabled={isGeneratingFix}
                  className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingFix ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>

              {isGeneratingFix ? (
                <div className="p-8 text-center space-y-3 bg-surface-2/40 rounded-xl border border-border">
                  <RefreshCw className="w-6 h-6 animate-spin text-accent mx-auto" />
                  <p className="text-xs text-muted">Synthesizing backward-compatible patch...</p>
                </div>
              ) : fixResult ? (
                <div className="space-y-3">
                  <p className="text-xs text-foreground bg-surface-2/60 p-3 rounded-lg border border-border">
                    {fixResult.explanation}
                  </p>

                  {/* Remediation Diff */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                        Suggested Diff
                      </span>
                      <button
                        onClick={() => handleCopy(fixResult.fixedSnippet, 'fixed-code')}
                        className="text-[11px] text-accent hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'fixed-code' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Copy Code
                      </button>
                    </div>

                    <pre className="p-2.5 rounded-lg bg-black/70 border border-emerald-500/20 text-[11px] font-mono text-butter-cream overflow-x-auto max-h-48 leading-4">
                      {fixResult.diff}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleApplyFix(fixResult.fixedSnippet)}
                      className="w-full py-2 rounded-xl bg-accent text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      {copiedKey === 'applied' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied to Editor!</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Apply Fix to Editor</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Steps */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                      Migration Roadmap
                    </span>
                    <ul className="space-y-1 text-xs text-muted list-disc list-inside bg-surface-2/30 p-2.5 rounded-lg border border-border">
                      {fixResult.steps.map((s, idx) => (
                        <li key={idx} className="leading-4">{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-2 bg-surface-2/30 rounded-xl border border-dashed border-border">
                  <Wrench className="w-5 h-5 text-accent mx-auto" />
                  <p className="text-xs text-foreground font-semibold">Generate Auto-Remediation</p>
                  <p className="text-[11px] text-muted">
                    Click Generate to produce drop-in backward-compatible fixes with deprecation headers and fallback parameters.
                  </p>
                  <button
                    onClick={handleRunFixes}
                    className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:opacity-90"
                  >
                    Generate Fixes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMIT MESSAGE OPTIMIZER */}
          {activeTab === 'commit-msg' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Commit Message AI (Conventional)
                </span>
                <button
                  onClick={handleRunCommitMsg}
                  disabled={isGeneratingCommitMsg}
                  className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingCommitMsg ? 'animate-spin' : ''}`} />
                  Generate New
                </button>
              </div>

              {isGeneratingCommitMsg ? (
                <div className="p-8 text-center space-y-3 bg-surface-2/40 rounded-xl border border-border">
                  <RefreshCw className="w-6 h-6 animate-spin text-accent mx-auto" />
                  <p className="text-xs text-muted">Analyzing code diffs for semantic commit message...</p>
                </div>
              ) : commitMsgResult ? (
                <div className="space-y-3">
                  {/* Primary Recommendation */}
                  <div className="p-3 bg-surface-2 rounded-xl border border-accent/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                        Recommended Conventional Commit
                      </span>
                      <button
                        onClick={() => handleCopy(`git commit -m "${commitMsgResult.title}"`, 'commit-cmd')}
                        className="text-[11px] text-accent hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'commit-cmd' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Copy Git Command
                      </button>
                    </div>

                    <div className="font-mono text-xs text-foreground font-bold bg-black/40 p-2 rounded border border-border">
                      {commitMsgResult.title}
                    </div>

                    <p className="text-[11px] text-muted leading-4">
                      {commitMsgResult.body}
                    </p>
                  </div>

                  {/* Alternative Suggestions */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                      Alternative Variations
                    </span>
                    {commitMsgResult.alternativeSuggestions.map((alt, i) => (
                      <div
                        key={i}
                        onClick={() => handleCopy(alt, `alt-${i}`)}
                        className="p-2 rounded-lg bg-surface-2/60 hover:bg-surface-2 border border-border text-xs font-mono cursor-pointer flex items-center justify-between group"
                      >
                        <span className="truncate group-hover:text-accent">{alt}</span>
                        {copiedKey === `alt-${i}` ? (
                          <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted flex-shrink-0 opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted/80 bg-surface-2/30 p-2.5 rounded-lg border border-border">
                    💡 {commitMsgResult.explanation}
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center space-y-2 bg-surface-2/30 rounded-xl border border-dashed border-border">
                  <GitCommit className="w-5 h-5 text-accent mx-auto" />
                  <p className="text-xs text-foreground font-semibold">Generate Semantic Commit</p>
                  <p className="text-[11px] text-muted">
                    Let Gemini 3.8 Flash formulate an optimized Conventional Commit message reflecting your API modifications.
                  </p>
                  <button
                    onClick={handleRunCommitMsg}
                    className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:opacity-90"
                  >
                    Generate Commit Message
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMMIT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Recent Commit History
                </span>
                <span className="text-xs text-muted">main branch</span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {MOCK_COMMITS.map((c) => (
                  <div key={c.sha} className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1.5 hover:border-accent/40 transition-all">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                        {c.sha}
                      </span>
                      <span className="text-[11px] text-muted">{c.date}</span>
                    </div>

                    <p className="text-xs font-semibold text-foreground leading-4">
                      {c.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-border/60">
                      <span>{c.author}</span>
                      <span className="font-mono text-[10px]">
                        +{c.insertions || 0} / -{c.deletions || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PREVIOUS ANALYSIS RUNS */}
          {activeTab === 'previous-runs' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Historical Analysis Runs
                </span>
                <span className="text-xs text-muted">{runs.length} Runs Logged</span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {runs.length === 0 ? (
                  <div className="p-4 rounded-xl bg-surface-2/50 text-center text-xs text-muted">
                    No previous runs recorded for this project yet. Trigger a run from the project overview!
                  </div>
                ) : (
                  runs.slice(0, 8).map((r) => {
                    const status = r.summary?.releaseStatus || r.status || 'safe';
                    const isBlocked = status === 'blocked';
                    const isReview = status === 'review';

                    return (
                      <div
                        key={r.id || r._id}
                        className="p-3 rounded-xl bg-surface-2/60 border border-border space-y-1.5 hover:border-accent/40 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {r.currentVersion || (r.headSha ? r.headSha.slice(0, 7) : 'v1.0.0')}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            isBlocked
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : isReview
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-muted">
                          <span>Breaking: {r.summary?.breaking ?? 0}</span>
                          <span>Warnings: {r.summary?.warning ?? 0}</span>
                          <span className="ml-auto">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL: CONNECT GITHUB / UPLOAD CODE */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-accent" />
                <h3 className="text-base font-bold text-foreground">
                  {importType === 'github' ? 'Connect GitHub Repository' : 'Upload API Code / Spec'}
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg hover:bg-surface-2 text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type selector */}
            <div className="flex rounded-xl bg-surface-2 p-1 border border-border">
              <button
                onClick={() => setImportType('github')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  importType === 'github' ? 'bg-accent text-white shadow-xs' : 'text-muted hover:text-foreground'
                }`}
              >
                GitHub Repo
              </button>
              <button
                onClick={() => setImportType('upload')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  importType === 'upload' ? 'bg-accent text-white shadow-xs' : 'text-muted hover:text-foreground'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setImportType('paste')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  importType === 'paste' ? 'bg-accent text-white shadow-xs' : 'text-muted hover:text-foreground'
                }`}
              >
                Paste Code
              </button>
            </div>

            {importType === 'github' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    placeholder="https://github.com/organization/repo"
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Branch</label>
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs focus:ring-1 focus:ring-accent"
                  />
                </div>

                <p className="text-xs text-muted">
                  shaktIQ will clone or fetch the specified branch, parse route definitions, and populate the live route explorer.
                </p>
              </div>
            )}

            {importType === 'upload' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground">Choose OpenAPI or Route File</label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-2 hover:border-accent/50 cursor-pointer transition-all">
                  <Upload className="w-8 h-8 text-muted mx-auto" />
                  <p className="text-xs font-semibold text-foreground">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-[11px] text-muted">Supports .yaml, .json, .ts, .js (up to 5MB)</p>
                  <input
                    type="file"
                    accept=".yaml,.yml,.json,.ts,.js"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const text = ev.target?.result as string;
                          if (text) {
                            setCodeContent(text);
                            setSelectedFile('openapi.yaml');
                            setShowImportModal(false);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="opacity-0 absolute inset-0 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {importType === 'paste' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Paste OpenAPI or Code snippet</label>
                <textarea
                  rows={8}
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="Paste OpenAPI YAML/JSON or Fastify/Express controller code..."
                  className="w-full p-3 rounded-xl bg-surface-2 border border-border text-xs font-mono focus:ring-1 focus:ring-accent"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-2 hover:bg-surface border border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (importType === 'paste' && uploadText.trim()) {
                    setCodeContent(uploadText);
                  }
                  setShowImportModal(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-accent text-white hover:opacity-90 shadow-xs"
              >
                Import & Analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
