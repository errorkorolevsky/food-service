# Developer Environment Report
**Date:** 2026-05-28

---

## Installed Dev Tools

| Tool | Version | Status |
|------|---------|--------|
| Node.js | v24.15.0 | ✅ Latest LTS |
| npm | 11.12.1 | ✅ Latest |
| Git | 2.54.0 | ✅ Recent |
| pnpm | Not installed | — |
| yarn | Not installed | — |
| VS Code | Latest stable | ✅ |
| Claude Code | 2.1.153 | ✅ Latest |
| agent-browser | 0.27.0 | ✅ |
| Vercel CLI | 54.2.0 | ✅ |
| gh (GitHub CLI) | 2.8.9 | ✅ |

---

## Active Projects

| Project | Path | Status |
|---------|------|--------|
| food-service | `C:\Users\77718\Desktop\food-service` | ✅ Active — main project |
| ai-workspace | `C:\Users\77718\ai-workspace` | Semi-active (last commit May 17) |
| Downloads/ai-workspace | `C:\Users\77718\Downloads\ai-workspace` | Duplicate — node_modules deleted |

---

## Claude Code Configuration

- Memory system: Active at `C:\Users\77718\.claude\projects\`
- 38 sprint memories indexed
- All project workflows documented
- Global tools: claude-code v2.1.153

**Optimization recommendations:**
- Claude Code is reading large project contexts. Consider adding `.claude/settings.json` with file exclusions to reduce context scanning:
  ```json
  {
    "ignorePatterns": [
      "node_modules/**",
      ".next/**",
      "public/products/**",
      "*.webp",
      "*.png"
    ]
  }
  ```

---

## Agent-Browser Optimization

13 stale Chrome session profiles were found in `%TEMP%` (total 960 MB).
These accumulate because each `agent-browser` call creates a fresh Chromium profile that is not always cleaned up.

**This is a known pattern** — they are safe to delete at any time. If you run frequent browser agent sessions, clean them weekly:

```powershell
# Add this as a weekly task or run manually:
Remove-Item "$env:TEMP\agent-browser-chrome-*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Agent-browser sessions cleaned."
```

---

## npm Global Package Health

```
C:\Users\77718\AppData\Roaming\npm (962 MB)
├── @anthropic-ai/claude-code@2.1.153  ← claude-code core
├── agent-browser@0.27.0
├── gh@2.8.9
└── vercel@54.2.0
```

All 4 packages are legitimate and current. The 962 MB is expected — claude-code bundles significant Node.js dependencies.

---

## VS Code Extensions

| Extension | Assessment |
|-----------|------------|
| `anthropic.claude-code` | ✅ Core extension |
| `bradlc.vscode-tailwindcss` | ✅ Essential for food-service |
| `ms-vscode.vscode-chat-customizations-evaluations` | Low value — Microsoft experiment extension. Can uninstall. |

**Minimal extension footprint is excellent** for performance. No bloat extensions detected.

---

## Recommended Next Steps

1. **RAM is the #1 bottleneck.** If budget allows, upgrade to 16 GB DDR3 (i5-3470 supports it, DDR3-1600 is cheap).
2. **Node options:** Set `$env:NODE_OPTIONS = "--max-old-space-size=4096"` permanently in PowerShell profile.
3. **Weekly cleanup script:** Create a PowerShell script to auto-clean agent-browser sessions + npm cache monthly.
4. **Consider moving projects to D:\ drive** — more free space, avoids C: pressure.
