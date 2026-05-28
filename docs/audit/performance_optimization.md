# Performance Optimization Report
**Date:** 2026-05-28

---

## Applied Optimizations

### VS Code Settings (Applied)
Updated `%APPDATA%\Code\User\settings.json`:

| Setting | Value | Impact |
|---------|-------|--------|
| `editor.minimap.enabled` | `false` | -15–30 MB VRAM/GPU load |
| `editor.codeLens` | `false` | Less AST traversal |
| `editor.inlayHints.enabled` | `off` | Less TypeScript server queries |
| `editor.stickyScroll.enabled` | `false` | Less DOM reflow |
| `editor.hover.delay` | `800ms` | Reduces TS server spam |
| `breadcrumbs.enabled` | `false` | Less UI overhead |
| `files.watcherExclude` | node_modules, .next, dist, build, .cache | **Major** — prevents VS Code from watching 450K+ files |
| `typescript.tsserver.maxTsServerMemory` | `3072 MB` | Gives TS server enough memory to stay fast |
| `git.autorefresh` / `git.autofetch` | `false` | Stops background git polling during builds |
| `git.decorations.enabled` | `false` | Removes per-file git status overlays (expensive on large projects) |
| `telemetry.telemetryLevel` | `off` | Stops background phone-home |
| `extensions.autoUpdate` | `false` | Prevents background downloads during dev |

---

## Recommended Manual Actions

### Priority 1 — Immediate RAM savings (saves ~1.4 GB)

**Close ChatGPT desktop app during dev sessions.**
The ChatGPT Electron app uses 5+ processes totaling ~1.25 GB RAM.
Use `chat.openai.com` in browser instead — same feature set, shared with existing browser memory.

```
Current: ChatGPT (5 processes) = 1,250 MB
Browser tab: ~80–120 MB
Savings: ~1.1–1.2 GB
```

### Priority 2 — Disable NVIDIA Overlay when not gaming (saves ~150 MB)

NVIDIA App / GeForce Experience overlay is running in background.
Right-click NVIDIA taskbar icon → Exit / Disable overlay.
Or: Task Manager → right-click `NVIDIA Overlay` → End Task (persists until reboot).

### Priority 3 — Disable Phone Link (saves ~155 MB)

Microsoft Phone Link is using 155 MB. If you don't actively use phone mirroring:
```
Settings → Apps → Installed Apps → Phone Link → Disable startup
```

### Priority 4 — Startup cleanup (saves RAM at boot)

```powershell
# Remove uTorrent and Steam from startup (launch manually when needed)
Remove-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "ut"
Remove-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "Steam"
```
Estimated RAM savings: ~80–120 MB

### Priority 5 — Windows Visual Effects (CPU savings on i5-3470)

```
Right-click My Computer → Properties → Advanced → Performance Settings
→ "Adjust for best performance" or manually disable:
  - Animate windows when minimizing
  - Animations in taskbar
  - Fade/slide menus
  - Show shadows under windows
```

---

## Node.js / Next.js Build Optimization

### Set NODE_OPTIONS for build performance

Add to your `.env.local` or PowerShell profile:
```powershell
$env:NODE_OPTIONS = "--max-old-space-size=4096"
```

This allows Node.js to use up to 4 GB heap before GC pressure — critical for Next.js builds on 8 GB RAM.

### Limit Next.js worker threads during build

Add to `next.config.ts`:
```typescript
// Limit parallel workers to 2 on 4-core machine
experimental: {
  cpus: 2,  // prevents build from saturating all 4 cores
}
```

### Use turbopack for faster dev server

```json
// package.json
"dev": "next dev --turbopack"
```
Turbopack is significantly faster than webpack for incremental builds on 4-core machines.

---

## Summary — Expected Improvements After All Actions

| Action | RAM Saved | CPU Impact |
|--------|-----------|------------|
| Close ChatGPT desktop | ~1.2 GB | — |
| Disable NVIDIA Overlay | ~150 MB | Minor |
| Disable Phone Link | ~155 MB | Minor |
| Disable startup bloat | ~100 MB | — |
| VS Code watcher exclude | — | High CPU reduction during file saves |
| **Total potential** | **~1.6 GB** | Significant |

**Net result:** From 5.6 GB used at idle → ~4.0 GB used at idle = 4 GB free for dev server + builds.
