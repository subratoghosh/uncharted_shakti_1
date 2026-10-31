import * as vscode from 'vscode';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

const execFileAsync = promisify(execFile);

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
};

type AnalyzeResponse = {
  ok: boolean;
  data?: {
    runId: string;
    summary: {
      total: number;
      breaking: number;
      warning: number;
      info: number;
      releaseStatus: 'safe' | 'review' | 'blocked';
    };
    findings: FindingItem[];
  };
  error?: {
    code: string;
    message: string;
  };
};

class FindingsTreeDataProvider implements vscode.TreeDataProvider<FindingTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FindingTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private findings: FindingItem[] = [];

  setFindings(findings: FindingItem[]) {
    this.findings = findings;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FindingTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FindingTreeItem): Thenable<FindingTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    if (this.findings.length === 0) {
      const empty = new FindingTreeItem('No breaking changes detected', 'Safe', 'safe');
      return Promise.resolve([empty]);
    }

    const items = this.findings.map(f => {
      const label = `${f.method} ${f.endpoint} [${f.changeType}]`;
      const item = new FindingTreeItem(label, f.description, f.severity, f);
      return item;
    });

    return Promise.resolve(items);
  }
}

class FindingTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly descriptionText: string,
    public readonly severity: 'breaking' | 'warning' | 'info' | 'safe',
    public readonly finding?: FindingItem,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = severity.toUpperCase();
    this.tooltip = finding
      ? `${descriptionText}\nImpact: ${finding.impact}\nRecommendation: ${finding.recommendation}`
      : descriptionText;

    if (severity === 'breaking') {
      this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
    } else if (severity === 'warning') {
      this.iconPath = new vscode.ThemeIcon(
        'warning',
        new vscode.ThemeColor('editorWarning.foreground'),
      );
    } else if (severity === 'info') {
      this.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor('editorInfo.foreground'));
    } else {
      this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
    }
  }
}

let lastRunId: string | null = null;

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('shaktiq');
  context.subscriptions.push(diagnosticCollection);

  const treeDataProvider = new FindingsTreeDataProvider();
  vscode.window.registerTreeDataProvider('shaktiq.findingsView', treeDataProvider);

  // Command: Sign in with token
  const signInCmd = vscode.commands.registerCommand('shaktiq.signIn', async () => {
    const token = await vscode.window.showInputBox({
      prompt: 'Enter your shaktIQ Personal Access Token (PAT)',
      password: true,
      ignoreFocusOut: true,
      placeHolder: 'sq_...',
    });

    if (!token) {
      return;
    }

    const config = vscode.workspace.getConfiguration('shaktiq');
    const apiUrl = config.get<string>('apiUrl', 'https://uncharted-shakti-1.onrender.com/api/v1');

    try {
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Authentication failed with status ${res.status}`);
      }

      await context.secrets.store('shaktiq.pat', token);
      vscode.window.showInformationMessage('Successfully signed in to shaktIQ!');
    } catch (err: unknown) {
      vscode.window.showErrorMessage(`shaktIQ sign in failed: ${(err as Error).message}`);
    }
  });

  // Command: Analyze API changes
  const analyzeCmd = vscode.commands.registerCommand('shaktiq.analyze', async () => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      vscode.window.showErrorMessage('Please open a workspace folder containing an OpenAPI spec.');
      return;
    }

    const workspaceRoot = folders[0]?.uri.fsPath;
    if (!workspaceRoot) {
      vscode.window.showErrorMessage('No workspace folder found.');
      return;
    }
    const config = vscode.workspace.getConfiguration('shaktiq');
    const specRelativePath = config.get<string>('specPath', 'openapi.yaml');
    const baseRef = config.get<string>('baseRef', 'HEAD');
    const apiUrl = config.get<string>('apiUrl', 'https://uncharted-shakti-1.onrender.com/api/v1');

    const specUri = vscode.Uri.file(path.join(workspaceRoot, specRelativePath));

    let headSpecContent: string;
    try {
      const doc = await vscode.workspace.openTextDocument(specUri);
      headSpecContent = doc.getText();
    } catch {
      vscode.window.showErrorMessage(`Could not read spec file at ${specRelativePath}`);
      return;
    }

    let baseSpecContent: string;
    try {
      const gitShow = await execFileAsync('git', ['show', `${baseRef}:${specRelativePath}`], {
        cwd: workspaceRoot,
      });
      baseSpecContent = gitShow.stdout;
    } catch {
      vscode.window.showWarningMessage(
        `Could not retrieve base spec from git ref ${baseRef}:${specRelativePath}. Using empty spec.`,
      );
      baseSpecContent = '';
    }

    const token = await context.secrets.get('shaktiq.pat');

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'shaktIQ: Analyzing OpenAPI changes...',
        cancellable: false,
      },
      async () => {
        try {
          const idempotencyKey = randomUUID();
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          };
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const res = await fetch(`${apiUrl}/cli/analyze`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              baseSpec: baseSpecContent,
              headSpec: headSpecContent,
              specPath: specRelativePath,
              branch: baseRef,
            }),
          });

          const json = (await res.json()) as AnalyzeResponse;

          if (!res.ok || !json.ok || !json.data) {
            const msg = json.error?.message || `Server returned status ${res.status}`;
            vscode.window.showErrorMessage(`shaktIQ Analysis error: ${msg}`);
            return;
          }

          lastRunId = json.data.runId;
          const findings = json.data.findings || [];

          // Update tree view
          treeDataProvider.setFindings(findings);

          // Update diagnostics
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

          diagnosticCollection.set(specUri, diagnostics);

          const summary = json.data.summary;
          const statusMsg = `Analysis complete: ${summary.breaking} breaking, ${summary.warning} warning (${summary.releaseStatus.toUpperCase()})`;
          if (summary.breaking > 0) {
            vscode.window.showErrorMessage(statusMsg, 'Open Dashboard').then(choice => {
              if (choice === 'Open Dashboard') {
                vscode.commands.executeCommand('shaktiq.openDashboard');
              }
            });
          } else {
            vscode.window.showInformationMessage(statusMsg, 'Open Dashboard').then(choice => {
              if (choice === 'Open Dashboard') {
                vscode.commands.executeCommand('shaktiq.openDashboard');
              }
            });
          }
        } catch (err: unknown) {
          vscode.window.showErrorMessage(`Failed to analyze: ${(err as Error).message}`);
        }
      },
    );
  });

  // Command: Open last run in dashboard
  const openDashboardCmd = vscode.commands.registerCommand('shaktiq.openDashboard', async () => {
    if (!lastRunId) {
      vscode.window.showInformationMessage('No recent analysis run found.');
      return;
    }

    const config = vscode.workspace.getConfiguration('shaktiq');
    const webUrl = config.get<string>('webUrl', 'https://shaktiq.vercel.app');
    const targetUri = vscode.Uri.parse(`${webUrl}/runs/${lastRunId}`);
    await vscode.env.openExternal(targetUri);
  });

  context.subscriptions.push(signInCmd, analyzeCmd, openDashboardCmd);
}

export function deactivate() {}
