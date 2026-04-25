# DevVelocity

DevVelocity is an offline-first VS Code extension that automatically tracks your developer activity and coding sessions locally. Gain insights into your productivity without sacrificing privacy.

## Features

- **Session Tracking**: Automatically detects when you start coding and ends sessions after periods of inactivity.
- **Streak System**: Calculates and displays your consecutive coding days.
- **Dashboard with Charts**: Visualizes your daily activity, session counts, and coding time over the last 7 days.
- **Local Storage**: Completely offline functionality with zero external dependencies for data tracking.

## How It Works

DevVelocity listens to your interactions within VS Code (such as typing and file switching) to detect active coding. It strictly records your start and end times to measure exact session durations. When you are idle for 5 minutes, the current session is automatically ended and stored safely on your machine using VS Code's internal global state API.

## Installation (Development Setup)

To test and run the extension locally:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate into the project and install dependencies:
   ```bash
   npm install
   ```
3. Compile the TypeScript codebase:
   ```bash
   npm run compile
   ```
4. Open the project in VS Code and press `F5` to launch the Extension Development Host.

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on macOS).
2. Run the command: `DevVelocity: Show Stats`
3. A Webview panel will open displaying your dashboard, which includes:
   - Total coding time for today
   - Number of sessions completed today
   - Your current coding streak
   - Interactive charts for daily time and session trends

## Project Structure

- `src/extension.ts`: The main entry point that initializes the extension, trackers, and commands.
- `src/tracker/`: Contains the logic for detecting VS Code interactions and managing session lifecycles.
- `src/storage/`: Handles the secure local persistence and retrieval of session data.
- `src/dashboard/`: Manages the UI presentation, including statistic calculations and rendering the modern chart-based Webview panel.

## Privacy

DevVelocity is built with a strict privacy-first mindset:
- **No external APIs**: The extension makes zero network requests to third-party tracking services.
- **No tracking**: Your coding habits are never monitored or transmitted remotely.
- **All data stored locally**: Every byte of your session history stays securely on your local machine.

## Contributing

Contributions are welcome! Please ensure that:
- You follow the existing event-driven, modular architecture.
- You avoid breaking the core session tracking and storage logic.
- You do not introduce any external data collection or heavy frontend frameworks.

## License

This project uses a custom license. Users may view and use the code for personal tracking but cannot claim the project as their own or distribute it as a competing product.

## Author

**Developer**: Jhon Paul Baonil
