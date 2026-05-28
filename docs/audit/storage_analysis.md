# Storage Analysis Report
**Date:** 2026-05-28

---

## Before / After Cleanup

| Drive | Before | After |
|-------|--------|-------|
| C: free | 53.2 GB | **57.5 GB** |
| Freed total | — | **~4.3 GB confirmed** |

---

## What Was Cleaned (Phase 2)

| Item | Size Freed | Method |
|------|-----------|--------|
| User Temp (`%TEMP%`) — installer blobs | 1,386 MB | `Remove-Item` |
| Stale agent-browser Chrome sessions | 960 MB | `Remove-Item` |
| npm cache (`npm cache clean --force`) | 1,919 MB | `npm cache clean` |
| VS Code installer temp cache | 169 MB | `Remove-Item` |
| Large orphaned `.tmp` file (wct3437.tmp) | 107 MB | `Remove-Item` |
| `scoped_dir*` Chromium temp folders | ~163 MB | `Remove-Item` |
| Downloads/ai-workspace/node_modules | 459 MB | `Remove-Item` |
| **Total** | **~5.2 GB** | |

---

## Storage Map (C: drive, post-cleanup)

```
C:\ (247 GB total, 57.5 GB free)
├── Users\77718\
│   ├── Downloads\           4.3 GB  ← still contains ai-workspace source (460 MB freed already)
│   ├── Desktop\             2.0 GB  ← food-service project lives here
│   │   └── food-service\.next  1.4 GB  ← build cache, safe to delete anytime
│   ├── Saved Games\         1.0 GB  ← game saves
│   ├── Documents\           0.8 GB
│   ├── ai-workspace\        0.4 GB  ← separate portfolio project (last used May 17)
│   ├── .vscode\             0.2 GB  ← VS Code config
│   ├── .claude\             0.1 GB  ← Claude Code memory/config
│   ├── AppData\Roaming\npm  0.9 GB  ← global npm packages (claude-code, gh, vercel, agent-browser)
│   └── AppData\Roaming\Claude  0.3 GB  ← Claude desktop app data
```

---

## Remaining Optimization Opportunities

| Item | Size | Action | Risk |
|------|------|--------|------|
| `food-service/.next` | 1.4 GB | Delete freely — rebuilt by `npm run build` | ZERO |
| `ai-workspace/.next` | 71 MB | Delete — rebuilds in seconds | ZERO |
| `AppData\Roaming\npm` | 962 MB | Leave — these are your active global tools | N/A |
| `ai-workspace\node_modules` | 327 MB | Safe to delete if not actively using | LOW |
| `Downloads` folder | 4.3 GB | Manual review recommended — old archives | MANUAL |

### Quick win — delete `.next` caches when short on space:
```powershell
Remove-Item "C:\Users\77718\Desktop\food-service\.next" -Recurse -Force
Remove-Item "C:\Users\77718\ai-workspace\.next" -Recurse -Force
# Frees ~1.5 GB instantly, rebuilt on next npm run dev
```

---

## D: Drive

```
D:\ (683 GB total, 390 GB free — 43% used)
├── GAMES\               44 GB
├── Modeling\            30 GB
├── CINVEST\             22 GB
├── ЧЕ ТО ТАМ\          12 GB
├── СБОРКИ ГТА\          11 GB
├── Program Files (x86)\ 1.6 GB  ← Steam
```

D: drive has 390 GB free — ideal for moving projects off C:. Consider symlinking food-service to D: if C: fills up.
