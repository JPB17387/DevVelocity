import * as vscode from 'vscode';
import { SessionManager } from './sessionManager';

export class ActivityTracker {
    private sessionManager: SessionManager;

    constructor(sessionManager: SessionManager) {
        this.sessionManager = sessionManager;
    }

    start(context: vscode.ExtensionContext) {
        // Trigger on typing / edits
        const textDocumentChangeDisposable = vscode.workspace.onDidChangeTextDocument(() => {
            this.sessionManager.recordActivity();
        });

        // Trigger when switching files
        const activeTextEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
            this.sessionManager.recordActivity();
        });

        context.subscriptions.push(
            textDocumentChangeDisposable,
            activeTextEditorChangeDisposable
        );
    }
}