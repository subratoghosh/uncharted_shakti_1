# shaktIQ – OpenAPI Breaking Change Detection & Release Intelligence for VS Code

[![Version](https://img.shields.io/badge/version-0.1.0-emerald.svg)](https://shaktiq.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Web Dashboard](https://img.shields.io/badge/Dashboard-shaktiq.vercel.app-teal.svg)](https://shaktiq.vercel.app)

Deterministic OpenAPI contract diffing, breaking change detection, and release safety intelligence directly in Visual Studio Code. Catch breaking changes before committing, pushing, or breaking downstream consumers.

---

## ⚡ Key Features

- **Local Git Diffing**: Compare your working OpenAPI specification (`openapi.yaml` or `swagger.json`) directly against any Git reference (`HEAD`, `main`, etc.) before committing.
- **Inline Editor Diagnostics**: Visual squiggly lines highlight breaking changes (Red), warnings (Yellow), and non-breaking additions (Blue) directly on affected paths, methods, and schema properties.
- **Dedicated Activity Bar Tree View**: Browse detected API findings organized by severity (`breaking`, `warning`, `info`) with one-click jump-to-definition.
- **Deep-Link to Cloud Dashboard**: One click opens the comprehensive **AI Release Dossier**, Blast Radius analysis, and stakeholder release notes on the [shaktIQ Web Dashboard](https://shaktiq.vercel.app).
- **Secure PAT Authentication**: Authenticate seamlessly with your personal access token, safely encrypted in the VS Code Secrets Store.

---

## 🚀 Quick Start Guide

### 1. Authenticate with shaktIQ
1. Log in to your shaktIQ Web Dashboard: [https://shaktiq.vercel.app](https://shaktiq.vercel.app).
2. Navigate to **Tokens** (`/tokens`) and generate a new **Personal Access Token (PAT)**.
3. In VS Code, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run:
   ```text
   shaktIQ: Sign in with token
   ```
4. Paste your token (`sq_...`).

### 2. Analyze Your OpenAPI Specification
Open any project workspace containing an OpenAPI specification and run:
```text
shaktIQ: Analyze API changes
```
shaktIQ will compare your current file against `HEAD` and populate:
- Visual squiggles on lines where breaking changes were introduced.
- The **shaktIQ** sidebar panel with an interactive findings list.
- An alert prompt to view the full analysis on your web dashboard.

---

## 🛠 Commands Reference

| Command | Action |
|:---|:---|
| `shaktIQ: Sign in with token` | Authenticate using your Personal Access Token. |
| `shaktIQ: Analyze API changes` | Perform in-flight contract diffing against your base Git reference. |
| `shaktIQ: Open last run in dashboard` | Open the active run detail page on [https://shaktiq.vercel.app](https://shaktiq.vercel.app). |

---

## ⚙️ Configuration Settings

Open your VS Code Settings (`Ctrl+,` / `Cmd+,`) and search for **shaktIQ**:

| Setting | Default | Description |
|:---|:---|:---|
| `shaktiq.apiUrl` | `https://uncharted-shakti-1.onrender.com/api/v1` | Backend API base URL where specs are analyzed. |
| `shaktiq.webUrl` | `https://shaktiq.vercel.app` | URL of the shaktIQ Web Dashboard. |
| `shaktiq.specPath` | `openapi.yaml` | Relative path to your OpenAPI specification file. |
| `shaktiq.baseRef` | `HEAD` | Git reference (branch or commit) to compare against. |

---

## 📄 License

MIT © [shaktIQ](https://shaktiq.vercel.app)
