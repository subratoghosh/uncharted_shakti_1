// VS Code Extension - owned by Vicky
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('shaktiq.signIn', async () => {
    vscode.window.showInformationMessage('ShaktIQ: Sign in command ready');
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
