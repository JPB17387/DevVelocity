"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTracker = void 0;
const vscode = require("vscode");
class ActivityTracker {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
    }
    start(context) {
        // Trigger on typing / edits
        const textDocumentChangeDisposable = vscode.workspace.onDidChangeTextDocument(() => {
            this.sessionManager.recordActivity();
        });
        // Trigger when switching files
        const activeTextEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
            this.sessionManager.recordActivity();
        });
        context.subscriptions.push(textDocumentChangeDisposable, activeTextEditorChangeDisposable);
    }
}
exports.ActivityTracker = ActivityTracker;
//# sourceMappingURL=activityTracker.js.map