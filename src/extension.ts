import * as vscode from 'vscode';
import { ActivityTracker } from './tracker/activityTracker';
import { SessionManager } from './tracker/sessionManager';
import { Storage } from './storage/storage';
import { registerDashboard } from './dashboard/dashboard';
import { registerDebugTools } from './debug/debugTools';

export function activate(context: vscode.ExtensionContext) {
    const storage = new Storage(context);
    const sessionManager = new SessionManager(storage);
    const tracker = new ActivityTracker(sessionManager);

    tracker.start(context);

    // Check idle every 30 seconds
    const interval = setInterval(() => {
        sessionManager.checkIdle();
    }, 30000);

    // Clear interval on extension deactivation
    context.subscriptions.push({
        dispose: () => clearInterval(interval)
    });

    registerDashboard(context, storage);
    registerDebugTools(context, storage);

    console.log("[DevVelocity] DevVelocity is now active 🚀");
}

export function deactivate() {}