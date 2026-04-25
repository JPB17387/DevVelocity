import * as vscode from 'vscode';

export interface Session {
    start: number;
    end: number;
    duration: number;
}

export class Storage {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    saveSession(session: Session) {
        try {
            const sessions = this.getSessions();
            sessions.push(session);
            this.context.globalState.update('sessions', sessions);
            console.log(`[DevVelocity] Session saved successfully.`);
        } catch (e) {
            console.error(`[DevVelocity] Error saving session:`, e);
        }
    }

    getSessions(): Session[] {
        try {
            const data = this.context.globalState.get<Session[]>('sessions', []);
            if (Array.isArray(data)) {
                return data;
            }
            return [];
        } catch (e) {
            console.error(`[DevVelocity] Error retrieving sessions, returning empty array.`, e);
            return [];
        }
    }

    clearSessions() {
        try {
            this.context.globalState.update('sessions', []);
            console.log(`[DevVelocity] All sessions cleared.`);
        } catch (e) {
            console.error(`[DevVelocity] Error clearing sessions:`, e);
        }
    }
}