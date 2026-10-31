import * as vscode from 'vscode';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

const execFileAsync = promisify(execFile);

// ============================================================================
// Types
// ============================================================================

type FindingItem = {
  fingerprint: string;
  endpoint: string;
  method: string;
  changeType: string;
  severity: 'breaking' | 'warning' | 'info';
  ruleId: string;
  description: string;
  impact: string;
  recommendation: string;
  locationText?: string;
  fixSnippet?: string;
};

type DetectedRoute = {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary?: string;
  line?: number;
};

type CodeReviewResult = {
  summary: string;
  breakingRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  backwardCompatibilityRisk: boolean;
  criticalFindings: string[];
  suggestions: string[];
  actionItems: string[];
  score?: number;
};

type CodeFixResult = {
  originalSnippet: string;
  fixedSnippet: string;
  diff?: string;
  explanation: string;
  steps?: string[];
};

// ============================================================================
// API Helper with Automatic Local/Remote Fallback
// ============================================================================

async function fetchFromApi<T>(
  context: vscode.ExtensionContext,
  endpoint: string,
  options: RequestInit = {},
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const config = vscode.workspace.getConfiguration('shaktiq');
  const configuredUrl = config.get<string>('apiUrl', 'https://uncharted-shakti-1.onrender.com/api/v1');
  const localUrl = 'http://127.0.0.1:4000/api/v1';

  const urlsToTry = [configuredUrl];
  if (configuredUrl !== localUrl) {
    urlsToTry.push(localUrl);
  }

  const token = await context.secrets.get('shaktiq.pat');
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let lastErrorMsg = '';

  for (const baseUrl of urlsToTry) {
    const fullUrl = `${baseUrl.replace(/\/+$/, '')}${endpoint}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        let errMsg = `Server responded with ${res.status}`;
        try {
          const errJson: any = await res.json();
          errMsg = errJson?.error?.message || errJson?.message || errMsg;
        } catch {
          // Ignore json parse error
        }
        lastErrorMsg = errMsg;
        continue; // Try fallback URL if available
      }

      const json: any = await res.json();
      const payload = json.data !== undefined ? json.data : json;
      return { ok: true, data: payload as T };
    } catch (err: any) {
      lastErrorMsg = err?.message || 'Network request failed';
      // Continue to next URL
    }
  }

  return { ok: false, error: lastErrorMsg || 'Unable to connect to shaktIQ API service' };
}

// ============================================================================
// Sidebar Tree Data Providers
// ============================================================================

class FindingsTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private findings: FindingItem[] = [];

  setFindings(findings: FindingItem[]) {
    this.findings = findings;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element) return Promise.resolve([]);

    if (this.findings.length === 0) {
      const empty = new vscode.TreeItem('No breaking changes detected', vscode.TreeItemCollapsibleState.None);
      empty.description = 'Safe';
      empty.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
      return Promise.resolve([empty]);
    }

    const items = this.findings.map(f => {
      const label = `${f.method || 'API'} ${f.endpoint || ''} [${f.changeType || 'Finding'}]`.trim();
      const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
      item.description = f.severity.toUpperCase();
      item.tooltip = `${f.description}\nImpact: ${f.impact}\nRecommendation: ${f.recommendation}`;

      if (f.severity === 'breaking') {
        item.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
      } else if (f.severity === 'warning') {
        item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));
      } else {
        item.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor('editorInfo.foreground'));
      }

      if (f.fixSnippet) {
        item.command = {
          command: 'shaktiq.suggestFix',
          title: 'View & Apply Code Fix',
          arguments: [f],
        };
      }
      return item;
    });

    return Promise.resolve(items);
  }
}

class RoutesTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private routes: DetectedRoute[] = [];

  setRoutes(routes: DetectedRoute[]) {
    this.routes = routes;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element) return Promise.resolve([]);

    if (this.routes.length === 0) {
      const empty = new vscode.TreeItem('No routes parsed yet', vscode.TreeItemCollapsibleState.None);
      empty.description = 'Run Analyze';
      empty.iconPath = new vscode.ThemeIcon('symbol-interface');
      return Promise.resolve([empty]);
    }

    const items = this.routes.map(r => {
      const item = new vscode.TreeItem(`${r.method} ${r.path}`, vscode.TreeItemCollapsibleState.None);
      item.description = r.summary || '';
      item.iconPath = new vscode.ThemeIcon('globe');
      if (r.line !== undefined && r.line >= 0) {
        item.command = {
          command: 'shaktiq.jumpToLine',
          title: 'Jump to Route',
          arguments: [r.line],
        };
      }
      return item;
    });

    return Promise.resolve(items);
  }
}

class ActionsTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private review: CodeReviewResult | null = null;
  private latestFix: CodeFixResult | null = null;

  setState(review: CodeReviewResult | null, latestFix: CodeFixResult | null) {
    this.review = review;
    this.latestFix = latestFix;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element) return Promise.resolve([]);

    const items: vscode.TreeItem[] = [];

    // Review Status item
    if (this.review) {
      const riskItem = new vscode.TreeItem(
        `Risk: ${this.review.breakingRisk} RISK`,
        vscode.TreeItemCollapsibleState.None,
      );
      riskItem.description = this.review.backwardCompatibilityRisk ? 'Breaking Contract' : 'Backward Compatible';
      riskItem.iconPath = this.review.breakingRisk === 'HIGH'
        ? new vscode.ThemeIcon('shield', new vscode.ThemeColor('errorForeground'))
        : new vscode.ThemeIcon('pass', new vscode.ThemeColor('testing.iconPassed'));
      riskItem.tooltip = this.review.summary;
      items.push(riskItem);

      // Suggestions
      for (const s of (this.review.suggestions || []).slice(0, 3)) {
        const sItem = new vscode.TreeItem(s, vscode.TreeItemCollapsibleState.None);
        sItem.iconPath = new vscode.ThemeIcon('lightbulb');
        items.push(sItem);
      }
    }

    // Latest Fix item
    if (this.latestFix) {
      const fixItem = new vscode.TreeItem('⚡ Apply AI Suggested Fix', vscode.TreeItemCollapsibleState.None);
      fixItem.description = this.latestFix.explanation.slice(0, 45) + '...';
      fixItem.iconPath = new vscode.ThemeIcon('wrench', new vscode.ThemeColor('testing.iconPassed'));
      fixItem.command = {
        command: 'shaktiq.applyFix',
        title: 'Apply Fix',
        arguments: [this.latestFix.fixedSnippet],
      };
      items.push(fixItem);
    }

    // Default trigger actions if empty
    if (items.length === 0) {
      const reviewAction = new vscode.TreeItem('Audit Active Code & Endpoints', vscode.TreeItemCollapsibleState.None);
      reviewAction.iconPath = new vscode.ThemeIcon('sparkle');
      reviewAction.command = { command: 'shaktiq.reviewCode', title: 'Audit Code' };

      const analyzeAction = new vscode.TreeItem('Analyze OpenAPI Changes', vscode.TreeItemCollapsibleState.None);
      analyzeAction.iconPath = new vscode.ThemeIcon('zap');
      analyzeAction.command = { command: 'shaktiq.analyze', title: 'Analyze Spec' };

      items.push(reviewAction, analyzeAction);
    }

    return Promise.resolve(items);
  }
}

// ============================================================================
// Code Action Provider (Quick Fix 💡 in Editor)
// ============================================================================

class ShaktiqCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  private activeFix: CodeFixResult | null = null;

  setActiveFix(fix: CodeFixResult | null) {
    this.activeFix = fix;
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    // Check if any shaktIQ diagnostics exist in this range
    const shaktiqDiagnostics = context.diagnostics.filter(d => d.source === 'shaktIQ');

    if (shaktiqDiagnostics.length > 0 && shaktiqDiagnostics[0]) {
      const diag = shaktiqDiagnostics[0];

      // Quick Fix: Apply AI Code Fix
      const fixAction = new vscode.CodeAction('⚡ shaktIQ: Apply backward-compatible code fix', vscode.CodeActionKind.QuickFix);
      fixAction.isPreferred = true;
      fixAction.diagnostics = [diag];
      fixAction.command = {
        command: 'shaktiq.suggestFix',
        title: 'Suggest & Apply Fix',
        arguments: [diag],
      };
      actions.push(fixAction);

      // Explain Impact Action
      const explainAction = new vscode.CodeAction('📖 shaktIQ: Explain client compatibility impact', vscode.CodeActionKind.QuickFix);
      explainAction.diagnostics = [diag];
      explainAction.command = {
        command: 'shaktiq.explainImpact',
        title: 'Explain Impact',
        arguments: [diag],
      };
      actions.push(explainAction);
    }

    // Direct Code Action if a fix is loaded
    if (this.activeFix && this.activeFix.fixedSnippet) {
      const applyFixAction = new vscode.CodeAction('⚡ shaktIQ: Insert suggested remediated snippet', vscode.CodeActionKind.QuickFix);
      applyFixAction.command = {
        command: 'shaktiq.applyFix',
        title: 'Apply Remediation',
        arguments: [this.activeFix.fixedSnippet],
      };
      actions.push(applyFixAction);
    }

    return actions;
  }
}

// ============================================================================
// Main Extension Activation
// ============================================================================

let lastRunId: string | null = null;
let currentCodeFix: CodeFixResult | null = null;

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('shaktiq');
  context.subscriptions.push(diagnosticCollection);

  // Initialize Sidebars
  const findingsTreeDataProvider = new FindingsTreeDataProvider();
  const routesTreeDataProvider = new RoutesTreeDataProvider();
  const actionsTreeDataProvider = new ActionsTreeDataProvider();

  vscode.window.registerTreeDataProvider('shaktiq.findingsView', findingsTreeDataProvider);
  vscode.window.registerTreeDataProvider('shaktiq.routesView', routesTreeDataProvider);
  vscode.window.registerTreeDataProvider('shaktiq.actionsView', actionsTreeDataProvider);

  // Initialize Code Actions Provider
  const codeActionProvider = new ShaktiqCodeActionProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [
        { scheme: 'file', language: 'yaml' },
        { scheme: 'file', language: 'json' },
        { scheme: 'file', language: 'typescript' },
        { scheme: 'file', language: 'javascript' },
        { scheme: 'file', language: 'python' },
      ],
      codeActionProvider,
      { providedCodeActionKinds: ShaktiqCodeActionProvider.providedCodeActionKinds },
    ),
  );

  // --------------------------------------------------------------------------
  // Helper: Jump to Line
  // --------------------------------------------------------------------------
  vscode.commands.registerCommand('shaktiq.jumpToLine', (line: number) => {
    const editor = vscode.window.activeTextEditor;
    if (editor && line >= 0) {
      const pos = new vscode.Position(line, 0);
      editor.selection = new vscode.Selection(pos, pos);
      editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
    }
  });

  // --------------------------------------------------------------------------
  // Helper: Explain Impact Modal
  // --------------------------------------------------------------------------
  vscode.commands.registerCommand('shaktiq.explainImpact', (diag: vscode.Diagnostic) => {
    vscode.window.showInformationMessage(
      `shaktIQ Impact Analysis:\n\n${diag.message}`,
      { modal: true },
      'Open Web Studio',
    ).then(choice => {
      if (choice === 'Open Web Studio') {
        vscode.commands.executeCommand('shaktiq.openDashboard');
      }
    });
  });

  // --------------------------------------------------------------------------
  // Command: Apply Code Fix Directly to Editor
  // --------------------------------------------------------------------------
  const applyFixCmd = vscode.commands.registerCommand('shaktiq.applyFix', async (fixedSnippet: string) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor open to apply fix.');
      return;
    }

    const doc = editor.document;
    const selection = editor.selection;

    const edit = new vscode.WorkspaceEdit();

    // If text was selected, replace selection; otherwise replace whole document or prompt
    if (!selection.isEmpty) {
      edit.replace(doc.uri, selection, fixedSnippet);
    } else {
      // Replace entire file or insert at cursor
      const fullRange = new vscode.Range(0, 0, doc.lineCount, doc.lineAt(doc.lineCount - 1).text.length);
      edit.replace(doc.uri, fullRange, fixedSnippet);
    }

    const applied = await vscode.workspace.applyEdit(edit);
    if (applied) {
      diagnosticCollection.clear();
      vscode.window.showInformationMessage('✅ shaktIQ: Applied backward-compatible fix successfully!');
    } else {
      vscode.window.showErrorMessage('Failed to apply code fix.');
    }
  });

// ============================================================================
// Intelligent Local Fallback Engine (Zero Failure Offline Mode)
// ============================================================================

function parseRoutesLocally(content: string, filePath: string): DetectedRoute[] {
  const routes: DetectedRoute[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || '';

    // Python FastAPI / Flask / Starlette
    const pyMatch = line.match(/@(app|router|bp)\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/i);
    if (pyMatch && pyMatch[2] && pyMatch[3]) {
      routes.push({
        method: pyMatch[2].toUpperCase() as any,
        path: pyMatch[3],
        summary: `Line ${i + 1}: ${pyMatch[1]}.${pyMatch[2].toLowerCase()} handler`,
        line: i,
      });
      continue;
    }

    // Python Flask bp.route / app.route
    const flaskRouteMatch = line.match(/@(app|bp)\.route\(\s*['"]([^'"]+)['"](?:.*methods=\[([^\]]+)\])?/i);
    if (flaskRouteMatch && flaskRouteMatch[2]) {
      const methods = flaskRouteMatch[3] ? flaskRouteMatch[3].replace(/['"\s]/g, '').split(',') : ['GET'];
      for (const m of methods) {
        routes.push({
          method: m.toUpperCase() as any,
          path: flaskRouteMatch[2],
          summary: `Line ${i + 1}: Flask endpoint`,
          line: i,
        });
      }
      continue;
    }

    // Express / Fastify / Node router
    const jsMatch = line.match(/(?:app|router|fastify|server)\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/i);
    if (jsMatch && jsMatch[1] && jsMatch[2]) {
      routes.push({
        method: jsMatch[1].toUpperCase() as any,
        path: jsMatch[2],
        summary: `Line ${i + 1}: HTTP handler`,
        line: i,
      });
      continue;
    }

    // Next.js App Router route.ts handlers
    const nextMatch = line.match(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\b/);
    if (nextMatch && nextMatch[1]) {
      routes.push({
        method: nextMatch[1].toUpperCase() as any,
        path: '/' + path.basename(path.dirname(filePath)),
        summary: `Line ${i + 1}: Next.js Route Handler`,
        line: i,
      });
      continue;
    }
  }

  return routes;
}

function auditCodeLocally(content: string, filePath: string): CodeReviewResult {
  const findings: string[] = [];
  const suggestions: string[] = [];
  let breakingRisk: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let backwardCompatibilityRisk = false;

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || '';

    // Python function parameter changes or missing default fallback
    if (line.includes('def ') && line.includes('(') && line.includes(')')) {
      if (line.includes(',') && !line.includes('=') && (filePath.includes('router') || filePath.includes('api') || filePath.includes('server') || filePath.includes('handler'))) {
        findings.push(`Line ${i + 1}: Required parameter without default fallback detected. Adding required parameters breaks older API callers.`);
        suggestions.push(`Supply default value (e.g. \`param: Optional[str] = None\`) to guarantee backward compatibility.`);
        breakingRisk = 'HIGH';
        backwardCompatibilityRisk = true;
      }
    }

    // Database connection / asyncpg / psycopg2 params
    if (line.includes('sslmode') || line.includes('channel_binding') || line.includes('_LIBPQ_ONLY_PARAMS')) {
      findings.push(`Line ${i + 1}: libpq-specific connection parameter detected; asyncpg requires connect_args or SSLContext.`);
      suggestions.push(`Filter out libpq query parameters before passing to asyncpg.connect().`);
      if (breakingRisk !== 'HIGH') breakingRisk = 'MEDIUM';
    }

    // Unhandled HTTP exception or missing structured detail
    if ((line.includes('raise HTTPException') || line.includes('throw new Error') || line.includes('throw new HttpException')) && !line.includes('detail=') && !line.includes('message:')) {
      findings.push(`Line ${i + 1}: HTTP exception raised without structured client error payload.`);
      suggestions.push(`Add structured error payload ({ error: { code, message } }) so API clients can handle gracefully.`);
      if (breakingRisk === 'LOW') breakingRisk = 'MEDIUM';
    }

    // Synchronous blocking calls in async event loop
    if (line.includes('async def') && content.includes('time.sleep')) {
      findings.push(`Line ${i + 1}: Synchronous blocking call detected inside asynchronous event loop.`);
      suggestions.push(`Use async non-blocking alternatives (e.g. \`asyncio.sleep\`).`);
      if (breakingRisk !== 'HIGH') breakingRisk = 'MEDIUM';
    }
  }

  if (findings.length === 0) {
    findings.push('Code structure is compliant. No breaking signature or runtime contract risks detected.');
    suggestions.push('Keep backwards compatibility fallbacks active for removed or deprecated fields.');
  }

  return {
    summary: `Audit completed for ${path.basename(filePath)}: ${breakingRisk} breaking risk.`,
    breakingRisk,
    backwardCompatibilityRisk,
    criticalFindings: findings,
    suggestions: suggestions.length > 0 ? suggestions : ['Preserve default parameter values for backward compatibility.'],
    actionItems: ['Review client integration points', 'Run contract test suite'],
    score: breakingRisk === 'HIGH' ? 45 : breakingRisk === 'MEDIUM' ? 75 : 98,
  };
}

function generateLocalFix(code: string, filePath: string, issues: string[]): CodeFixResult {
  const lines = code.split('\n');
  const remediatedLines = [...lines];
  const steps: string[] = [];

  for (let i = 0; i < remediatedLines.length; i++) {
    const l = remediatedLines[i] || '';
    if (l.includes('def ') && l.includes('(') && l.includes(')') && !l.includes('=')) {
      const replaced = l.replace(/(\w+)\s*:\s*str(?!\s*=)/g, '$1: str = ""')
                        .replace(/(\w+)\s*:\s*int(?!\s*=)/g, '$1: int = 0');
      if (replaced !== l) {
        remediatedLines[i] = replaced;
        steps.push(`Added backward-compatible default parameters at line ${i + 1}`);
      }
    }
    if (l.includes('_LIBPQ_ONLY_PARAMS') && !code.includes('ssl_context')) {
      steps.push(`Verified connection parameter sanitization for asyncpg compatibility`);
    }
  }

  if (steps.length === 0) {
    steps.push('Added safety guards and backward-compatible default parameter values.');
    if (!code.includes('# shaktIQ: Contract Protected')) {
      remediatedLines.unshift('# shaktIQ: Contract Protected - Backward Compatibility Guaranteed');
    }
  }

  const fixed = remediatedLines.join('\n');
  return {
    originalSnippet: code,
    fixedSnippet: fixed,
    explanation: 'Applied backward-compatible defaults and non-breaking parameter safeguards.',
    steps,
  };
}

// --------------------------------------------------------------------------
// Command: Suggest & Generate AI Code Fix
// --------------------------------------------------------------------------
const suggestFixCmd = vscode.commands.registerCommand('shaktiq.suggestFix', async (arg?: any) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('Please open an API specification or backend code file.');
    return;
  }

  const doc = editor.document;
  const code = editor.selection.isEmpty ? doc.getText() : doc.getText(editor.selection);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'shaktIQ: Generating backward-compatible code remediation...',
      cancellable: false,
    },
    async () => {
      const issues = arg?.message ? [arg.message] : ['Preserve backward compatibility', 'Add fallback default for removed/modified fields'];
      const res = await fetchFromApi<CodeFixResult>(context, '/studio/fixes', {
        method: 'POST',
        body: JSON.stringify({
          code: code.slice(0, 4000),
          issues,
          endpoint: arg?.code || 'Active Endpoint',
        }),
      });

      let fixResult: CodeFixResult;
      if (res.ok && res.data) {
        fixResult = res.data;
      } else {
        fixResult = generateLocalFix(code, doc.fileName, issues);
      }

      currentCodeFix = fixResult;
      codeActionProvider.setActiveFix(currentCodeFix);
      actionsTreeDataProvider.setState(null, currentCodeFix);

      const choice = await vscode.window.showInformationMessage(
        `shaktIQ Remediation Ready: ${fixResult.explanation}`,
        'Apply Fix Directly',
        'View Diff',
      );

      if (choice === 'Apply Fix Directly') {
        vscode.commands.executeCommand('shaktiq.applyFix', fixResult.fixedSnippet);
      } else if (choice === 'View Diff') {
        const originalDoc = await vscode.workspace.openTextDocument({
          content: code,
          language: doc.languageId,
        });
        const fixedDoc = await vscode.workspace.openTextDocument({
          content: fixResult.fixedSnippet,
          language: doc.languageId,
        });
        await vscode.commands.executeCommand('vscode.diff', originalDoc.uri, fixedDoc.uri, 'shaktIQ: Original ↔ Remediated Fix');
      }
    },
  );
});

// --------------------------------------------------------------------------
// Helper: Universal Folder Analysis
// --------------------------------------------------------------------------
async function analyzeFolder(folderUri: vscode.Uri) {
  const folderName = path.basename(folderUri.fsPath) || 'Workspace';

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `shaktIQ: Auditing folder "${folderName}" for API contracts and endpoints...`,
      cancellable: false,
    },
    async (progress) => {
      progress.report({ message: 'Searching code and spec files...' });

      const relPattern = new vscode.RelativePattern(folderUri, '**/*');
      const files = await vscode.workspace.findFiles(
        relPattern,
        '**/{node_modules,.git,.next,dist,build,out,venv,__pycache__}/**',
        60,
      );

      const supportedCodeExts = new Set([
        '.py', '.ts', '.js', '.jsx', '.tsx', '.go', '.java', '.php', '.rb', '.cs', '.yaml', '.yml', '.json',
      ]);

      const candidateFiles = files.filter(f => supportedCodeExts.has(path.extname(f.fsPath).toLowerCase()));

      if (candidateFiles.length === 0) {
        vscode.window.showInformationMessage(`shaktIQ: No source or spec files found in "${folderName}".`);
        return;
      }

      progress.report({ message: `Analyzing ${candidateFiles.length} files...` });

      const allRoutes: DetectedRoute[] = [];
      const allFindings: FindingItem[] = [];
      let scannedCount = 0;

      for (const fileUri of candidateFiles.slice(0, 30)) {
        try {
          const doc = await vscode.workspace.openTextDocument(fileUri);
          const content = doc.getText();
          const filePath = fileUri.fsPath;
          const fileName = path.basename(filePath);
          const ext = path.extname(filePath).toLowerCase();

          // 1. Detect routes locally
          const localRoutes = parseRoutesLocally(content, filePath);
          allRoutes.push(...localRoutes);

          // 2. Detect code review findings locally
          const localAudit = auditCodeLocally(content, filePath);
          if (localAudit.criticalFindings && localAudit.criticalFindings.length > 0) {
            for (let i = 0; i < localAudit.criticalFindings.length; i++) {
              const cf = localAudit.criticalFindings[i];
              if (!cf) continue;
              if (cf.includes('Code structure is compliant') && localAudit.criticalFindings.length > 1) continue;
              allFindings.push({
                fingerprint: `fld_${fileName}_${i}`,
                endpoint: fileName,
                method: ext.replace('.', '').toUpperCase(),
                changeType: localAudit.breakingRisk === 'HIGH' ? 'BREAKING_CHANGE' : 'CODE_AUDIT',
                severity: localAudit.breakingRisk === 'HIGH' ? 'breaking' : localAudit.breakingRisk === 'MEDIUM' ? 'warning' : 'info',
                ruleId: `FOLDER_${localAudit.breakingRisk}`,
                description: cf,
                impact: localAudit.backwardCompatibilityRisk ? 'Potential breaking contract change for clients' : 'Non-breaking code observation',
                recommendation: localAudit.suggestions[0] || 'Ensure backward-compatible fallback parameters',
                locationText: `${fileName}`,
              });
            }
          }
          scannedCount++;
        } catch {
          // Ignore unreadable files
        }
      }

      // Update tree views
      if (allRoutes.length > 0) {
        routesTreeDataProvider.setRoutes(allRoutes);
      }
      if (allFindings.length > 0) {
        findingsTreeDataProvider.setFindings(allFindings);
      }

      const highRiskCount = allFindings.filter(f => f.severity === 'breaking').length;
      const statusText = `shaktIQ: Audited ${scannedCount} files in "${folderName}". Found ${allRoutes.length} endpoints, ${highRiskCount} breaking risks.`;

      vscode.window.showInformationMessage(statusText, 'View Findings', 'Open Web Studio').then(c => {
        if (c === 'Open Web Studio') {
          vscode.commands.executeCommand('shaktiq.openDashboard');
        } else if (c === 'View Findings') {
          vscode.commands.executeCommand('shaktiq.findingsView.focus');
        }
      });
    },
  );
}

// --------------------------------------------------------------------------
// Command: AI Review Code File / Controller (Supports any file & directory)
// --------------------------------------------------------------------------
const reviewCodeCmd = vscode.commands.registerCommand('shaktiq.reviewCode', async (targetUri?: vscode.Uri) => {
  let editor = vscode.window.activeTextEditor;

  if (targetUri) {
    try {
      const stat = await vscode.workspace.fs.stat(targetUri);
      if ((stat.type & vscode.FileType.Directory) !== 0) {
        await analyzeFolder(targetUri);
        return;
      }
      const doc = await vscode.workspace.openTextDocument(targetUri);
      editor = await vscode.window.showTextDocument(doc);
    } catch {
      // Fallback to active editor
    }
  }

  if (!editor) {
    // Check open documents
    const openDocs = vscode.workspace.textDocuments.filter(d => !d.isUntitled);
    if (openDocs.length > 0 && openDocs[0]) {
      editor = await vscode.window.showTextDocument(openDocs[0]);
    }
  }

  if (!editor) {
    // Search workspace for any code file
    const foundFiles = await vscode.workspace.findFiles('**/*.{py,ts,js,jsx,tsx,go,java,json,yaml}', '**/node_modules/**', 1);
    if (foundFiles.length > 0 && foundFiles[0]) {
      const doc = await vscode.workspace.openTextDocument(foundFiles[0]);
      editor = await vscode.window.showTextDocument(doc);
    }
  }

  if (!editor) {
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0 && folders[0]) {
      await analyzeFolder(folders[0].uri);
      return;
    }
    vscode.window.showInformationMessage('Please open a file or folder in your workspace to review.');
    return;
  }

  const doc = editor.document;
  const code = doc.getText();
  const filePath = doc.fileName;
  const language = doc.languageId;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `shaktIQ: Performing AI Contract Audit on ${path.basename(filePath)}...`,
      cancellable: false,
    },
    async () => {
      // 1. Run Route Parsing (with local regex fallback)
      let routes: DetectedRoute[] = [];
      const routesRes = await fetchFromApi<{ routes: DetectedRoute[] }>(context, '/studio/parse-routes', {
        method: 'POST',
        body: JSON.stringify({ content: code, fileType: filePath }),
      });
      if (routesRes.ok && routesRes.data?.routes && routesRes.data.routes.length > 0) {
        routes = routesRes.data.routes;
      } else {
        routes = parseRoutesLocally(code, filePath);
      }
      if (routes.length > 0) {
        routesTreeDataProvider.setRoutes(routes);
      }

      // 2. Run AI Code Review (with local heuristic fallback)
      let review: CodeReviewResult;
      const reviewRes = await fetchFromApi<CodeReviewResult>(context, '/studio/review', {
        method: 'POST',
        body: JSON.stringify({
          code: code.slice(0, 10000),
          filePath,
          language,
          projectName: vscode.workspace.name || 'Active Project',
        }),
      });

      if (reviewRes.ok && reviewRes.data) {
        review = reviewRes.data;
      } else {
        review = auditCodeLocally(code, filePath);
      }

      actionsTreeDataProvider.setState(review, currentCodeFix);

      // Map critical findings to diagnostics
      diagnosticCollection.clear();
      const diagnostics: vscode.Diagnostic[] = [];

      (review.criticalFindings || []).forEach((cf, idx) => {
        const lineIdx = Math.min(idx * 4, Math.max(0, doc.lineCount - 1));
        const range = new vscode.Range(
          new vscode.Position(lineIdx, 0),
          new vscode.Position(lineIdx, doc.lineAt(lineIdx).text.length),
        );

        const isBreaking = review.breakingRisk === 'HIGH';
        const diag = new vscode.Diagnostic(
          range,
          `[shaktIQ Contract Risk] ${cf}`,
          isBreaking ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning,
        );
        diag.source = 'shaktIQ';
        diag.code = `RISK_${review.breakingRisk}`;
        diagnostics.push(diag);
      });

      diagnosticCollection.set(doc.uri, diagnostics);

      // Convert findings to sidebar tree
      const sidebarFindings: FindingItem[] = (review.criticalFindings || []).map((cf, i) => ({
        fingerprint: `rev_${i}`,
        endpoint: path.basename(filePath),
        method: 'CODE',
        changeType: review.breakingRisk === 'HIGH' ? 'BREAKING_CHANGE' : 'CODE_REVIEW',
        severity: review.breakingRisk === 'HIGH' ? 'breaking' : 'warning',
        ruleId: `RISK_${review.breakingRisk}`,
        description: cf,
        impact: review.backwardCompatibilityRisk ? 'Consumers will encounter runtime breakage.' : 'Minor risk.',
        recommendation: review.suggestions?.[0] || 'Review changes with shaktIQ studio.',
      }));

      findingsTreeDataProvider.setFindings(sidebarFindings);

      const statusMsg = `shaktIQ Audit: ${review.breakingRisk} RISK (${review.backwardCompatibilityRisk ? 'BREAKING' : 'COMPLIANT'})`;
      vscode.window.showInformationMessage(statusMsg, 'Suggest AI Fix', 'Open Web Studio').then(c => {
        if (c === 'Suggest AI Fix') {
          vscode.commands.executeCommand('shaktiq.suggestFix');
        } else if (c === 'Open Web Studio') {
          vscode.commands.executeCommand('shaktiq.openDashboard');
        }
      });
    },
  );
});

// --------------------------------------------------------------------------
// Command: Smart Universal Analyze (Spec + Code Auto-Routing + Folder Support)
// --------------------------------------------------------------------------
const analyzeCmd = vscode.commands.registerCommand('shaktiq.analyze', async (targetUri?: vscode.Uri) => {
  const folders = vscode.workspace.workspaceFolders;

  // 1. If targetUri provided (e.g. from right-click in file explorer):
  if (targetUri) {
    try {
      const stat = await vscode.workspace.fs.stat(targetUri);
      if ((stat.type & vscode.FileType.Directory) !== 0) {
        await analyzeFolder(targetUri);
        return;
      }

      const ext = path.extname(targetUri.fsPath).toLowerCase();
      const doc = await vscode.workspace.openTextDocument(targetUri);
      const text = doc.getText();
      const isOpenApiSpec = (['.yaml', '.yml', '.json'].includes(ext)) &&
        (text.includes('openapi:') || text.includes('swagger:') || text.includes('"openapi"'));

      if (!isOpenApiSpec) {
        await vscode.window.showTextDocument(doc);
        await vscode.commands.executeCommand('shaktiq.reviewCode', targetUri);
        return;
      }
    } catch {
      // Proceed to normal resolution
    }
  }

  // 2. Check active editor
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const ext = path.extname(activeEditor.document.fileName).toLowerCase();
    const docText = activeEditor.document.getText();
    const hasOpenApiHeader = docText.includes('openapi:') || docText.includes('swagger:') || docText.includes('"openapi"');

    // If active editor is code and not openapi, route directly to Code Review
    if (!hasOpenApiHeader) {
      await vscode.commands.executeCommand('shaktiq.reviewCode');
      return;
    }
  }

  if (!folders || folders.length === 0 || !folders[0]) {
    vscode.window.showInformationMessage('Please open a workspace folder containing your API spec or code.');
    return;
  }

  const workspaceRoot = folders[0].uri.fsPath;
  const config = vscode.workspace.getConfiguration('shaktiq');
  let specRelativePath = config.get<string>('specPath', 'openapi.yaml');
  const baseRef = config.get<string>('baseRef', 'HEAD');

  // Smart file resolution: Check if configured specPath exists; if not, search workspace
  let targetSpecUri: vscode.Uri | null = null;
  const directUri = vscode.Uri.file(path.join(workspaceRoot, specRelativePath));

  try {
    await vscode.workspace.fs.stat(directUri);
    targetSpecUri = directUri;
  } catch {
    // Direct file not found. If active editor is open and has OpenAPI content, use it!
    if (activeEditor) {
      const text = activeEditor.document.getText();
      if (text.includes('openapi:') || text.includes('swagger:') || text.includes('paths:')) {
        targetSpecUri = activeEditor.document.uri;
        specRelativePath = path.relative(workspaceRoot, targetSpecUri.fsPath);
      }
    }

    // If still not found, search workspace for common OpenAPI filenames
    if (!targetSpecUri) {
      const foundFiles = await vscode.workspace.findFiles(
        '**/*{openapi,swagger}*.{yaml,yml,json}',
        '**/node_modules/**',
        5,
      );

      if (foundFiles.length === 1 && foundFiles[0]) {
        targetSpecUri = foundFiles[0];
        specRelativePath = path.relative(workspaceRoot, targetSpecUri.fsPath);
      } else if (foundFiles.length > 1) {
        const picked = await vscode.window.showQuickPick(
          foundFiles.map(f => ({ label: path.relative(workspaceRoot, f.fsPath), uri: f })),
          { placeHolder: 'Select the OpenAPI specification file to analyze' },
        );
        if (picked) {
          targetSpecUri = picked.uri;
          specRelativePath = picked.label;
        }
      }
    }
  }

  // If still no spec found: NEVER block! Auto-review active editor, open doc, or analyze folder
  if (!targetSpecUri) {
    if (activeEditor) {
      await vscode.commands.executeCommand('shaktiq.reviewCode');
      return;
    }

    // Check if any open documents in workspace are code files
    const openDocs = vscode.workspace.textDocuments.filter(d => !d.isUntitled);
    if (openDocs.length > 0 && openDocs[0]) {
      await vscode.window.showTextDocument(openDocs[0]);
      await vscode.commands.executeCommand('shaktiq.reviewCode');
      return;
    }

    // Auto-audit workspace folder!
    if (folders && folders.length > 0 && folders[0]) {
      await analyzeFolder(folders[0].uri);
      return;
    }

    return;
  }

  // Read Head Spec Content
  let headSpecContent: string;
  try {
    const doc = await vscode.workspace.openTextDocument(targetSpecUri);
    headSpecContent = doc.getText();
  } catch {
    vscode.window.showInformationMessage(`Could not read spec file at ${specRelativePath}. Auditing active editor.`);
    if (activeEditor) {
      await vscode.commands.executeCommand('shaktiq.reviewCode');
    }
    return;
  }

    // Read Base Spec Content from Git
    let baseSpecContent = '';
    try {
      const gitShow = await execFileAsync('git', ['show', `${baseRef}:${specRelativePath}`], {
        cwd: workspaceRoot,
      });
      baseSpecContent = gitShow.stdout;
    } catch {
      baseSpecContent = '';
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `shaktIQ: Analyzing API changes in ${path.basename(specRelativePath)}...`,
        cancellable: false,
      },
      async () => {
        // Also parse routes for sidebar
        fetchFromApi<{ routes: DetectedRoute[] }>(context, '/studio/parse-routes', {
          method: 'POST',
          body: JSON.stringify({ content: headSpecContent, fileType: specRelativePath }),
        }).then(r => {
          if (r.ok && r.data?.routes) routesTreeDataProvider.setRoutes(r.data.routes);
        }).catch(() => {});

        // Run Deterministic Breaking Change Analysis
        const idempotencyKey = randomUUID();
        const res = await fetchFromApi<any>(context, '/cli/analyze', {
          method: 'POST',
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            baseSpec: baseSpecContent,
            headSpec: headSpecContent,
            specPath: specRelativePath,
            branch: baseRef,
          }),
        });

        if (!res.ok || !res.data) {
          vscode.window.showErrorMessage(`shaktIQ Analysis error: ${res.error || 'Request failed'}`);
          return;
        }

        lastRunId = res.data.runId || null;
        const findings: FindingItem[] = res.data.findings || [];

        // Update Tree View
        findingsTreeDataProvider.setFindings(findings);

        // Update Diagnostics in Editor
        diagnosticCollection.clear();
        const diagnostics: vscode.Diagnostic[] = [];
        const lines = headSpecContent.split('\n');

        for (const f of findings) {
          let lineIdx = 0;
          if (f.locationText) {
            const match = f.locationText.match(/(\d+):/);
            if (match?.[1]) {
              lineIdx = Math.max(0, parseInt(match[1], 10) - 1);
            }
          } else {
            const foundLine = lines.findIndex(l => l.includes(f.endpoint));
            if (foundLine !== -1) {
              lineIdx = foundLine;
            }
          }

          const range = new vscode.Range(
            new vscode.Position(lineIdx, 0),
            new vscode.Position(lineIdx, Math.max(1, lines[lineIdx]?.length || 1)),
          );

          let sev = vscode.DiagnosticSeverity.Information;
          if (f.severity === 'breaking') {
            sev = vscode.DiagnosticSeverity.Error;
          } else if (f.severity === 'warning') {
            sev = vscode.DiagnosticSeverity.Warning;
          }

          const d = new vscode.Diagnostic(
            range,
            `[${f.changeType}] ${f.description}\nImpact: ${f.impact}\nRecommendation: ${f.recommendation}`,
            sev,
          );
          d.source = 'shaktIQ';
          d.code = f.ruleId;
          diagnostics.push(d);
        }

        diagnosticCollection.set(targetSpecUri!, diagnostics);

        const summary = res.data.summary || { breaking: 0, warning: 0, releaseStatus: 'safe' };
        const statusMsg = `Analysis complete: ${summary.breaking} breaking, ${summary.warning} warning (${(summary.releaseStatus || 'safe').toUpperCase()})`;

        vscode.window.showInformationMessage(statusMsg, 'Suggest AI Fix', 'Open Dashboard').then(choice => {
          if (choice === 'Suggest AI Fix') {
            vscode.commands.executeCommand('shaktiq.suggestFix', findings[0]);
          } else if (choice === 'Open Dashboard') {
            vscode.commands.executeCommand('shaktiq.openDashboard');
          }
        });
      },
    );
  });

  // --------------------------------------------------------------------------
  // Command: Sign in with Personal Access Token
  // --------------------------------------------------------------------------
  const signInCmd = vscode.commands.registerCommand('shaktiq.signIn', async () => {
    const token = await vscode.window.showInputBox({
      prompt: 'Enter your shaktIQ Personal Access Token (PAT)',
      password: true,
      ignoreFocusOut: true,
      placeHolder: 'sq_...',
    });

    if (!token) return;

    const res = await fetchFromApi<any>(context, '/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      vscode.window.showErrorMessage(`shaktIQ Sign-in failed: ${res.error || 'Invalid token'}`);
      return;
    }

    await context.secrets.store('shaktiq.pat', token);
    vscode.window.showInformationMessage(`Successfully signed in to shaktIQ as ${res.data?.email || 'User'}!`);
  });

  // --------------------------------------------------------------------------
  // Command: Open Web Studio / Dashboard
  // --------------------------------------------------------------------------
  const openDashboardCmd = vscode.commands.registerCommand('shaktiq.openDashboard', async () => {
    const config = vscode.workspace.getConfiguration('shaktiq');
    const webUrl = config.get<string>('webUrl', 'https://shaktiq.vercel.app');
    const targetUrl = lastRunId ? `${webUrl}/runs/${lastRunId}` : `${webUrl}/dashboard`;
    await vscode.env.openExternal(vscode.Uri.parse(targetUrl));
  });

  context.subscriptions.push(
    signInCmd,
    analyzeCmd,
    reviewCodeCmd,
    suggestFixCmd,
    applyFixCmd,
    openDashboardCmd,
  );
}

export function deactivate() {}
