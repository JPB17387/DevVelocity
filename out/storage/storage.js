"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
class Storage {
    constructor(context) {
        this.context = context;
    }
    saveSession(session) {
        try {
            const sessions = this.getSessions();
            sessions.push(session);
            this.context.globalState.update('sessions', sessions);
            console.log(`[DevVelocity] Session saved successfully.`);
        }
        catch (e) {
            console.error(`[DevVelocity] Error saving session:`, e);
        }
    }
    getSessions() {
        try {
            const data = this.context.globalState.get('sessions', []);
            if (Array.isArray(data)) {
                return data;
            }
            return [];
        }
        catch (e) {
            console.error(`[DevVelocity] Error retrieving sessions, returning empty array.`, e);
            return [];
        }
    }
    clearSessions() {
        try {
            this.context.globalState.update('sessions', []);
            console.log(`[DevVelocity] All sessions cleared.`);
        }
        catch (e) {
            console.error(`[DevVelocity] Error clearing sessions:`, e);
        }
    }
}
exports.Storage = Storage;
//# sourceMappingURL=storage.js.map