# ShaktIQ – Design System

## 1. Philosophy
A calm, dense, reading-first developer tool in the spirit of Linear/Vercel/GitHub: information first, restrained color, color only where it carries meaning (severity, status). No gradients, glassmorphism, glowing orbs, emoji headings or decorative animation. Both user panel and admin panel share one system; admin differs only by a persistent "Admin" label and a darker sidebar accent bar.

## 2. Color Tokens (CSS variables, light default + dark)
| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | #FAFAF9 | #0C0C0D | page |
| `--surface` | #FFFFFF | #151517 | cards |
| `--surface-2` | #F4F4F2 | #1C1C1F | table headers, code |
| `--border` | #E4E4E0 | #2A2A2E | lines |
| `--text` | #18181B | #ECECEE | primary |
| `--text-muted` | #6B6B73 | #9A9AA3 | secondary |
| `--accent` | #2B50E6 | #6C8CFF | primary buttons, links, focus |
| `--sev-breaking` | #DC2626 | #F87171 | breaking / blocked |
| `--sev-warning` | #B45309 | #FBBF24 | warning / review |
| `--sev-info` | #0369A1 | #38BDF8 | info |
| `--ok` | #15803D | #4ADE80 | safe / completed |
Severity/status backgrounds use the color at 10% opacity with 1px border at 30%. Never rely on color alone: always pair with text label or icon.

## 3. Typography
- Sans: Geist Sans (`next/font`), mono: Geist Mono for paths, SHAs, JSON.
- Scale: 12 (caption), 13 (table/dense), 14 (body), 16 (lead), 20 (h3), 24 (h2), 30 (h1). Weights 400/500/600. Line height 1.5 body, 1.25 headings.
- Endpoints always render in mono as `METHOD /path` with method as colored-neutral tag (GET blue-gray, POST green-gray, DELETE red-gray, others neutral).

## 4. Spacing, Radius, Shadow
- Base unit 4px; scale 4, 8, 12, 16, 24, 32, 48. Page padding 24 (desktop) / 16 (mobile). Card padding 16–20.
- Radius: 6 (inputs/buttons/badges), 10 (cards), 999 (status dots). 
- Shadows: none by default; `0 1px 2px rgba(0,0,0,.06)` on popovers and dropdowns only. Separation via borders.

## 5. Components (shadcn/ui based, theme overrides in `apps/web/src/styles/tokens.css`)
- **Buttons:** primary (accent fill), secondary (border), ghost, destructive (red). Height 32 (sm) / 36 (md). Visible focus ring `2px accent` offset 2.
- **Inputs:** 36px, 1px border, focus ring accent; error state red border + message below; labels above, never placeholder-only.
- **Cards:** surface, 1px border, radius 10, optional header row with title + action.
- **Tables:** 13px text, sticky header on `--surface-2`, row hover `--surface-2`, no zebra, row height 40, right-aligned numerics, mono for IDs. Clickable rows have a chevron and keyboard focus.
- **Badges:** severity (`Breaking`, `Warning`, `Info`), run status (`Queued` neutral, `Running` accent with pulsing dot (only animation allowed), `Completed` ok, `Failed` red), diff status (`New`, `Resolved`, `Unresolved`), source (`GitHub`, `Manual`, `VS Code`).
- **Alerts:** inline banners with icon + title + body; variants error / warning / info / success. Release verdict banner is the one large alert on the report page.
- **Navigation:** left sidebar 232px (collapses to icon rail < 1024px, drawer < 640px). User items: Overview, Projects, Runs, Tokens, Settings. Admin items: Admin Overview, All Projects, All Runs, Events, Workflows, Users. Top bar: breadcrumb, live-connection dot (SSE), theme toggle, user menu.

## 6. Dashboard Layout
- Content max width 1280, 12-column grid.
- **Project overview:** KPI row (4 stat cards: Latest status, Breaking, Warnings, Runs) → recent runs table → hotspot endpoints card.
- **Run detail:** header (commit SHA, versions, source, status) → verdict banner → findings table with filters (severity, method, text) → side drawer for finding detail (description, impact, recommendation, memory timeline, AI explanation if present).
- **Compare:** two run selectors → three tabs: New / Resolved / Unresolved with counts.
- **Report:** printable single column with disclaimer footer.
- Recharts: one bar chart (findings by severity per run) and one line chart (breaking count over time), neutral grid, severity colors only.

## 7. Responsive Behavior
Breakpoints: 640 / 1024 / 1280. Tables become horizontally scrollable with sticky first column below 1024. KPI cards 4→2→1 columns. Drawers become full-screen sheets on mobile.

## 8. Accessibility
WCAG AA contrast; all interactive controls reachable by keyboard; `aria-live="polite"` on run status region; focus trapped in drawers/dialogs; badges have text; tables use proper `<th scope>`; respect `prefers-reduced-motion`; minimum 36px hit targets.

## 9. Empty / Loading / Error States
- **Empty:** icon-less text block: title, one sentence, primary action (e.g. "No runs yet – Run first analysis").
- **Loading:** skeleton rows matching table layout; spinner only inside buttons.
- **Error:** inline alert with `error.code`, message, "Retry" button; failed runs show `errorCode` and `errorMessage` in the run header.
- **Offline SSE:** muted dot turns amber with "Reconnecting…"; data refetched on reconnect.

## 10. Copy Rules
Plain, specific, no marketing. Verdict labels exactly: "Safe based on configured checks", "Warning: review required", "Not ready: blocking changes detected".
