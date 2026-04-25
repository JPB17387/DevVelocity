"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDebug = logDebug;
exports.validateSessions = validateSessions;
exports.registerDebugTools = registerDebugTools;
const vscode = require("vscode");
const outputChannel = vscode.window.createOutputChannel("DevVelocity Debug");
function logDebug(message) {
    outputChannel.appendLine(`[DevVelocity] ${message}`);
}
function validateSessions(sessions) {
    let hasErrors = false;
    for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i];
        // Check end < start
        if (session.end < session.start) {
            logDebug(`WARNING: Session has end time before start time. Start: ${session.start}, End: ${session.end}`);
            hasErrors = true;
        }
        // Check duration mismatch
        if (session.duration !== (session.end - session.start)) {
            logDebug(`WARNING: Session duration mismatch. Expected: ${session.end - session.start}, Found: ${session.duration}`);
            hasErrors = true;
        }
        // Check overlapping sessions
        for (let j = i + 1; j < sessions.length; j++) {
            const other = sessions[j];
            if (session.start < other.end && other.start < session.end) {
                logDebug(`WARNING: Overlapping sessions detected.`);
                logDebug(`Session 1: ${session.start} to ${session.end}`);
                logDebug(`Session 2: ${other.start} to ${other.end}`);
                hasErrors = true;
            }
        }
    }
    if (!hasErrors) {
        logDebug("Validation passed: No issues found in sessions.");
    }
}
function registerDebugTools(context, storage) {
    context.subscriptions.push(outputChannel);
    const showSessionsCommand = vscode.commands.registerCommand('devvelocity.debug.showSessions', () => {
        const sessions = storage.getSessions();
        logDebug(`--- Raw Sessions (${sessions.length}) ---`);
        validateSessions(sessions);
        logDebug(JSON.stringify(sessions, null, 2));
        vscode.window.showInformationMessage(`Found ${sessions.length} sessions. Check DevVelocity Debug channel for details.`);
        outputChannel.show(true);
    });
    const clearSessionsCommand = vscode.commands.registerCommand('devvelocity.debug.clearSessions', async () => {
        const confirmation = await vscode.window.showWarningMessage('Are you sure you want to clear all sessions?', 'Yes', 'No');
        if (confirmation === 'Yes') {
            storage.clearSessions();
            logDebug('Storage write: All sessions have been cleared by user.');
            vscode.window.showInformationMessage('DevVelocity: All sessions cleared.');
        }
    });
    const simulateSessionCommand = vscode.commands.registerCommand('devvelocity.debug.simulateSession', () => {
        const now = Date.now();
        // Random 5-30 minutes
        const randomMinutes = Math.floor(Math.random() * 26) + 5;
        const randomMs = randomMinutes * 60 * 1000;
        const start = now - randomMs;
        const end = now;
        const duration = end - start;
        const fakeSession = {
            start,
            end,
            duration
        };
        logDebug(`Session start: ${new Date(start).toISOString()}`);
        logDebug(`Session end: ${new Date(end).toISOString()}`);
        logDebug(`Duration: ${duration} ms`);
        storage.saveSession(fakeSession);
        logDebug(`Storage write: Simulated session saved`);
        vscode.window.showInformationMessage(`Simulated a ${randomMinutes}-minute session.`);
    });
    context.subscriptions.push(showSessionsCommand, clearSessionsCommand, simulateSessionCommand);
}
//# sourceMappingURL=debugTools.js.map