import { Storage } from '../storage/storage';

export class SessionManager {
    private lastActivity: number = Date.now();
    private sessionStart: number | null = null;
    private IDLE_LIMIT = 5 * 60 * 1000; // 5 minutes

    constructor(private storage: Storage) {}

    recordActivity() {
        const now = Date.now();

        if (this.sessionStart === null) {
            this.sessionStart = now;
            console.log(`[DevVelocity] Session started at ${new Date(this.sessionStart).toLocaleTimeString()}`);
        }

        this.lastActivity = now;
    }

    checkIdle() {
        if (this.sessionStart === null) {
            return;
        }

        const now = Date.now();
        if (now - this.lastActivity > this.IDLE_LIMIT) {
            // End the session at the time of last activity to be accurate
            const duration = this.lastActivity - this.sessionStart;

            console.log(`[DevVelocity] Session ended at ${new Date(this.lastActivity).toLocaleTimeString()}`);
            console.log(`[DevVelocity] Duration: ${Math.floor(duration / 60000)} minutes`);

            this.storage.saveSession({
                start: this.sessionStart,
                end: this.lastActivity,
                duration: duration
            });

            this.sessionStart = null;
        }
    }
}
