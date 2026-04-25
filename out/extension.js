"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const activityTracker_1 = require("./tracker/activityTracker");
const sessionManager_1 = require("./tracker/sessionManager");
const storage_1 = require("./storage/storage");
const dashboard_1 = require("./dashboard/dashboard");
const debugTools_1 = require("./debug/debugTools");
function activate(context) {
    const storage = new storage_1.Storage(context);
    const sessionManager = new sessionManager_1.SessionManager(storage);
    const tracker = new activityTracker_1.ActivityTracker(sessionManager);
    tracker.start(context);
    // Check idle every 30 seconds
    const interval = setInterval(() => {
        sessionManager.checkIdle();
    }, 30000);
    // Clear interval on extension deactivation
    context.subscriptions.push({
        dispose: () => clearInterval(interval)
    });
    (0, dashboard_1.registerDashboard)(context, storage);
    (0, debugTools_1.registerDebugTools)(context, storage);
    console.log("[DevVelocity] DevVelocity is now active 🚀");
}
function deactivate() { }
//# sourceMappingURL=extension.js.map