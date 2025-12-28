# Wordle Clone (Next.js 15)

A LAN-accessible Wordle-like game built with Next.js 15, TypeScript, and Tailwind CSS.

## Features
- **Server Authority**: Logic and validation happen on the server.
- **LAN Play capable**: Bind to 0.0.0.0 for local network access.
- **Daily Puzzle**: Deterministic puzzle based on date.
- **Persistence**: Refreshes do not lose game state (localStorage).
- **Stats**: Tracks wins, streaks, and guess distribution locally.
- **High Contrast Mode**: Accessible color palette override.
- **Responsive**: Works on desktop and mobile.

## Prerequisites
- Node.js 18+ (20+ recommended).

## Installation & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   - Access at `http://localhost:3000` on host.
   - Access at `http://<LAN-IP>:3000` on other devices (e.g. `192.168.1.5:3000`).
   - **Note**: Ensure your firewall allows Node.js incoming connections.

3. **Running Tests**
   ```bash
   npm test
   # Validates word logic units
   
   npm run validate:words
   # Checks integrity of data/answers.txt and data/allowed.txt
   ```

## LAN Access
To find your local IP:
- **Windows**: Open PowerShell/CMD, type `ipconfig`. Look for "IPv4 Address" (e.g., 192.168.x.x).
- **macOS/Linux**: Open Terminal, type `ifconfig` or `ip a`.

## Word Lists
- Data files located in `data/`.
- `answers.txt`: The daily solutions.
- `allowed.txt`: The full dictionary of valid guesses (must contain all answers).
- You can paste typical Wordle 5-letter lists into these files.
- Run `npm run validate:words` after updating to ensure validity.

## Project Structure
- `app/`: Next.js App Router.
- `components/`: UI (Grid, Keyboard, StatsModal).
- `lib/`: Logic (stats.ts, word-logic.ts, wordlists.ts).
- `scripts/`: Tooling (validation).

## PASS 2 Updates
- Added LocalStorage persistence.
- Added Statistics and Graph UI.
- Added High Contrast Mode.
- Refactored `globals.css` with semantic classes.
- Added test suite and validation scripts.

## Share a Link (Public Access)
You can easily share your local instance with friends over the internet using **Cloudflare Tunnel** (recommended) or **LocalTunnel**.

### 1. Cloudflare Tunnel (Recommended)
This uses Cloudflare's free "Quick Tunnel" feature. No account or domain required.

#### Install `cloudflared`
- **Windows**: `winget install Cloudflare.cloudflared`
- **macOS**: `brew install cloudflared`
- **Linux**: See [Cloudflare Downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)

#### Usage
Run one of the following commands:

```bash
# Production mode (builds & starts app + tunnel)
npm run share

# Dev mode (starts dev server + tunnel)
npm run share:dev
```

Look for the **TryCloudflare** URL in the output, for example:
`https://crazy-random-name.trycloudflare.com`

---

### 2. LocalTunnel (Fallback)
If you cannot install Cloudflare, use LocalTunnel (requires no extra installation, runs via npx).

```bash
npm run share:lt
```
*Note: LocalTunnel connections may be less stable and URLs change every time.*

---

### ⚠️ Security Warning
**Running these commands exposes your local app to the public internet.**
- Anyone with the link can play.
- Do not leave the tunnel running indefinitely efficiently.
- Stop the tunnel (Ctrl+C) when you are done sharing.
