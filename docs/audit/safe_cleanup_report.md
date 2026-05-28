# Safe Cleanup Report
**Date:** 2026-05-28  
**C: Free Before:** 53.2 GB  
**C: Free After:** 57.5 GB  
**Total Freed:** ~4.3 GB (confirmed on disk)

---

## Completed Cleanup Actions

### 1. npm Cache — 1,919 MB freed
```
Command: npm cache clean --force
Before: C:\Users\77718\AppData\Local\npm-cache = 1,933 MB
After:  13.8 MB
```
Safe — npm rebuilds cache automatically on next install. No functionality lost.

### 2. Stale Agent-Browser Chrome Sessions — 960 MB freed
```
Location: %TEMP%\agent-browser-chrome-*
Deleted: 13 orphaned browser profile directories
Largest: 106 MB each
```
These are abandoned Chromium profiles from previous Claude Code browser-agent runs. Fully safe to delete — new sessions create fresh profiles.

### 3. Installer Temp Blobs — 1,386 MB freed
```
Location: %TEMP%\[8char].[3char] named folders
Deleted: ~59 folders including 9 × 125 MB MSI installer caches
```
Windows MSI installer leftover extraction directories. Safe to delete after installation completes.

### 4. VS Code Installer Cache — 169 MB freed
```
Location: %TEMP%\vscode-stable-user-x64
```
VS Code installer working directory — installer already ran, this was abandoned.

### 5. Large Orphaned .tmp File — 107 MB freed
```
File: %TEMP%\wct3437.tmp
```
Abandoned temp file, not locked by any process.

### 6. scoped_dir Chromium Folders — ~163 MB freed
```
Location: %TEMP%\scoped_dir*
Deleted: 8 folders (96 MB + 62 MB largest)
```
Chromium/browser renderer temp directories, all abandoned.

### 7. Downloads/ai-workspace/node_modules — 459 MB freed
```
Location: C:\Users\77718\Downloads\ai-workspace\node_modules
Last modified: May 15, 2026 — clearly abandoned duplicate
```
Source code preserved. Only `node_modules` deleted (reinstallable with `npm install`).

---

## What Was NOT Deleted

| Item | Why Kept |
|------|----------|
| `food-service/node_modules` | Active project dependency |
| `food-service/.next` | Active build cache |
| `ai-workspace/node_modules` | Active portfolio project (last used May 17) |
| `AppData\Roaming\npm` | Global tools: claude-code, gh, vercel, agent-browser |
| `AppData\Roaming\Claude` | Claude desktop app data |
| Windows Update cache | Protected system path |
| Downloads folder contents | Requires manual review |

---

## Remaining Quick Wins (Manual)

Run these anytime C: is low on space — zero risk:
```powershell
# Frees 1.5 GB instantly (rebuilt on next npm run dev/build)
Remove-Item "C:\Users\77718\Desktop\food-service\.next" -Recurse -Force
Remove-Item "C:\Users\77718\ai-workspace\.next" -Recurse -Force
```
