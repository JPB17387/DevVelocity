import * as vscode from 'vscode';
import { Storage, Session } from '../storage/storage';

export function getTodayStats(sessions: Session[]): { totalMinutes: number; sessionCount: number; lastSessionMinutes: number } {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todaySessions = sessions.filter(s => s.end >= startOfDay || s.start >= startOfDay);
    
    let totalMs = 0;
    let lastSessionMs = 0;
    
    for (const session of todaySessions) {
        totalMs += session.duration;
    }
    
    if (todaySessions.length > 0) {
        // Assuming sessions are in chronological order, last one is the latest.
        const lastSession = todaySessions.reduce((latest, current) => current.end > latest.end ? current : latest, todaySessions[0]);
        lastSessionMs = lastSession.duration;
    }

    return {
        totalMinutes: Math.floor(totalMs / 60000),
        sessionCount: todaySessions.length,
        lastSessionMinutes: Math.floor(lastSessionMs / 60000)
    };
}

export function getStreak(sessions: Session[]): { currentStreak: number } {
    const days = new Set<number>();
    for (const s of sessions) {
        const d = new Date(s.start);
        days.add(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime());
    }

    const sortedDays = Array.from(days).sort((a, b) => b - a);

    let currentStreak = 0;
    const now = new Date();
    let expectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (sortedDays.length === 0) {
        return { currentStreak: 0 };
    }

    const todayTime = expectedDate.getTime();
    const yesterdayTime = new Date(expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate() - 1).getTime();

    // Filter out future dates just in case
    const pastDays = sortedDays.filter(d => d <= todayTime);

    if (pastDays.length === 0) {
        return { currentStreak: 0 };
    }

    if (pastDays[0] === todayTime) {
        // Coded today
    } else if (pastDays[0] === yesterdayTime) {
        // Coded yesterday, hasn't coded today yet
        expectedDate = new Date(expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate() - 1);
    } else {
        // Gap > 1 day
        return { currentStreak: 0 };
    }

    for (const day of pastDays) {
        if (day === expectedDate.getTime()) {
            currentStreak++;
            expectedDate = new Date(expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate() - 1);
        } else if (day < expectedDate.getTime()) {
            break;
        }
    }

    return { currentStreak };
}

export function registerDashboard(context: vscode.ExtensionContext, storage: Storage) {
    const disposable = vscode.commands.registerCommand('devvelocity.showDashboard', () => {
        console.log('[DevVelocity] Opening dashboard');

        const panel = vscode.window.createWebviewPanel(
            'devVelocityDashboard',
            'DevVelocity Stats',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        const sessions = storage.getSessions();
        const stats = getTodayStats(sessions);
        const streak = getStreak(sessions);

        panel.webview.html = getWebviewContent(stats, streak);
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(
    stats: { totalMinutes: number; sessionCount: number; lastSessionMinutes: number },
    streak: { currentStreak: number }
): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevVelocity Stats</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
        }
        h1 {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .stat-card {
            margin-bottom: 15px;
            padding: 15px;
            background-color: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 4px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <h1>DevVelocity Dashboard</h1>
    
    <div class="stat-card">
        <div>Today:</div>
        <div class="stat-value">${stats.totalMinutes} minutes</div>
    </div>
    
    <div class="stat-card">
        <div>Sessions:</div>
        <div class="stat-value">${stats.sessionCount}</div>
    </div>
    
    <div class="stat-card">
        <div>Last Session:</div>
        <div class="stat-value">${stats.lastSessionMinutes} minutes</div>
    </div>
    
    <div class="stat-card">
        <div>🔥 Streak:</div>
        <div class="stat-value">${streak.currentStreak} days</div>
    </div>
</body>
</html>`;
}
