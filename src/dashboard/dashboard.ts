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

export function getWeeklyStats(sessions: Session[]): { labels: string[], durations: number[], counts: number[] } {
    const labels: string[] = [];
    const durations: number[] = [];
    const counts: number[] = [];

    const now = new Date();
    // For last 7 days, from 6 days ago to today
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const startOfDay = d.getTime();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1).getTime();

        labels.push(`${d.getMonth() + 1}/${d.getDate()}`);

        const daySessions = sessions.filter(s => s.start >= startOfDay && s.start < endOfDay);
        
        let totalMs = 0;
        for (const s of daySessions) {
            totalMs += s.duration;
        }

        durations.push(Math.floor(totalMs / 60000));
        counts.push(daySessions.length);
    }

    return { labels, durations, counts };
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
        const weeklyStats = getWeeklyStats(sessions);

        const logoPathOnDisk = vscode.Uri.joinPath(context.extensionUri, 'public', 'assets', 'DevVelocity.png');
        const logoUri = panel.webview.asWebviewUri(logoPathOnDisk);

        panel.webview.html = getWebviewContent(stats, streak, weeklyStats, logoUri.toString());
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(
    stats: { totalMinutes: number; sessionCount: number; lastSessionMinutes: number },
    streak: { currentStreak: number },
    weekly: { labels: string[]; durations: number[]; counts: number[] },
    logoUri: string
): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevVelocity Stats</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 30px;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            max-width: 900px;
            margin: 0 auto;
        }
        .header-container {
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .header-logo {
            height: 40px;
            margin-right: 15px;
        }
        h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0;
            padding: 0;
            border: none;
        }
        .cards-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            padding: 20px;
            background-color: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .stat-card-title {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        .charts-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
        }
        .chart-wrapper {
            background-color: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .chart-title {
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
            color: var(--vscode-editor-foreground);
        }
    </style>
</head>
<body>
    <div class="header-container">
        <img src="${logoUri}" alt="DevVelocity Logo" class="header-logo">
        <h1>DevVelocity Dashboard</h1>
    </div>
    
    <div class="cards-container">
        <div class="stat-card">
            <div class="stat-card-title">Today's Time</div>
            <div class="stat-value">${stats.totalMinutes} <span style="font-size: 16px;">min</span></div>
        </div>
        <div class="stat-card">
            <div class="stat-card-title">Sessions Today</div>
            <div class="stat-value">${stats.sessionCount}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-title">Current Streak</div>
            <div class="stat-value">🔥 ${streak.currentStreak} <span style="font-size: 16px;">days</span></div>
        </div>
    </div>

    <div class="charts-container">
        <div class="chart-wrapper">
            <div class="chart-title">Time per Day (Last 7 Days)</div>
            <canvas id="timeChart"></canvas>
        </div>
        <div class="chart-wrapper">
            <div class="chart-title">Sessions per Day (Last 7 Days)</div>
            <canvas id="sessionsChart"></canvas>
        </div>
    </div>

    <script>
        const labels = ${JSON.stringify(weekly.labels)};
        const durations = ${JSON.stringify(weekly.durations)};
        const counts = ${JSON.stringify(weekly.counts)};

        const textColor = getComputedStyle(document.body).getPropertyValue('--vscode-editor-foreground').trim();
        const gridColor = getComputedStyle(document.body).getPropertyValue('--vscode-panel-border').trim();
        const primaryColor = getComputedStyle(document.body).getPropertyValue('--vscode-textLink-foreground').trim() || '#007acc';

        Chart.defaults.color = textColor;

        // Time Chart
        new Chart(document.getElementById('timeChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Minutes',
                    data: durations,
                    backgroundColor: primaryColor,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Sessions Chart
        new Chart(document.getElementById('sessionsChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sessions',
                    data: counts,
                    borderColor: primaryColor,
                    backgroundColor: primaryColor,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: gridColor }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    </script>
</body>
</html>`;
}
