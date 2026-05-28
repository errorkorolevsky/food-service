# System Audit Report
**Date:** 2026-05-28  
**Machine:** Intel i5-3470 @ 3.20GHz | 8 GB RAM | Windows 10 Pro 22H2

---

## Hardware Profile

| Component | Spec | Assessment |
|-----------|------|------------|
| CPU | Intel Core i5-3470 (2012, 4c/4t, 3.20GHz) | **BOTTLENECK** — no hyperthreading, old IPC. Node.js build competes with VS Code + browser. |
| RAM | 8 GB DDR3 | **CRITICAL CONSTRAINT** — 70.9% used at idle. 5.6 GB consumed before dev work starts. |
| Disk C: | 247 GB SSD (post-cleanup: 57.5 GB free) | OK after cleanup. Keep >15% free. |
| Disk D: | 683 GB (389 GB free) | Healthy. Use for project repos/archives. |
| Pagefile | 16 GB on C: | Allocated but peak usage only 39 MB — system is not swapping yet. |

**Critical finding:** This machine was designed for ~2-3 apps simultaneously. Running ChatGPT desktop (Electron, ~1.2 GB), VS Code (~1.3 GB), Claude Code (353 MB), and a Next.js dev server concurrently exhausts all 8 GB with no headroom.

---

## RAM Consumers at Audit Time

| Process | RAM |
|---------|-----|
| ChatGPT (5 processes total) | ~1.25 GB |
| VS Code (7 processes) | ~1.35 GB |
| Claude Code | 353 MB |
| NVIDIA Overlay | 152 MB |
| Phone Link | 155 MB |
| Windows Defender (MsMpEng) | 260 MB |
| Explorer | 154 MB |
| Other svchosts | ~300 MB |

**Conclusion:** Close ChatGPT desktop app during dev sessions — it alone costs 1.25 GB and has no advantage over the web version on this machine.

---

## System Events

| Event | Severity | Notes |
|-------|----------|-------|
| VMX not enabled in BIOS | INFO | Hyper-V/virtualization disabled. Not harmful, just means Docker Desktop won't run. |
| VMSP service failed | INFO | Follows from VMX disabled. Normal. |
| Secure Boot CA needs update | LOW | Foxconn H61MXE board. Old firmware. Cosmetic warning. |
| Realtek USB WiFi errors | MEDIUM | `Realtek 8811CU Wireless LAN` returning invalid values. Consider updating driver or switching to wired. |
| DCOM timeout errors | LOW | Normal Windows noise on startup. |

---

## Key Findings

1. **RAM is the primary bottleneck** — 8 GB is insufficient for this workload
2. **ChatGPT desktop app is the biggest single RAM drain** (not dev-related)
3. **Pagefile is large (16 GB) but barely used** — system OK for now but any RAM spike will cause swapping
4. **NVIDIA Overlay running in background** — costs 150 MB, disable if not using NVIDIA GeForce Experience actively
5. **Phone Link active** — 155 MB for feature rarely needed during dev
6. **uTorrent on startup** — opens P2P ports, unexpected background network usage
