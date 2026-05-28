# Security Findings Report
**Date:** 2026-05-28

---

## Overall Security Status: ACCEPTABLE

Windows Defender is active and healthy:
- AM Service: Enabled
- Real-time Protection: Enabled
- Antispyware: Enabled
- Antivirus: Enabled
- Running Mode: Normal

No active malware, crypto miners, or browser hijackers detected.

---

## Findings by Severity

### MEDIUM

| Finding | Detail | Recommendation |
|---------|--------|----------------|
| **uTorrent on startup** | Launches at Windows startup, opens P2P ports, connects to external tracker servers. Background network activity during dev sessions. | Remove from startup: `HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run` → delete `ut` key. Launch manually when needed. |
| **Realtek 8811CU WiFi driver errors** | USB WiFi adapter returning invalid values to driver repeatedly. Could indicate driver instability — network drops during builds or git pushes. | Update driver: Device Manager → Network Adapters → Realtek 8811CU → Update Driver. Or use wired ethernet. |

### LOW

| Finding | Detail | Recommendation |
|---------|--------|----------------|
| **CCleaner UAC bypass scheduled task** | Task `CCleaner 7 - Skip UAC` runs with elevated privileges without UAC prompt. Industry-recognized risky behavior. | Review: if CCleaner is trusted, acceptable. Otherwise uninstall CCleaner and delete the task. |
| **Secure Boot CA needs update** | BIOS/firmware on Foxconn H61MXE board is outdated. Secure Boot chain may not cover new signing keys. | Cosmetic on a development workstation. No immediate action needed. |
| **Hypervisor / VMX disabled in BIOS** | Virtualization not enabled. Means Docker Desktop will fail. Not a security issue itself. | Enable in BIOS if Docker is needed. |

### INFO

| Finding | Detail |
|---------|--------|
| Opera GX scheduled auto-update tasks | Normal browser update behavior. Not suspicious. |
| NVIDIA profile updater tasks | Normal NVIDIA driver behavior. |
| OneDrive tasks | Standard Microsoft sync tasks. |
| Google platform experience helper | Standard Google Software Update. |
| Apple Software Update | iTunes/iCloud updater. Low impact. |

---

## Startup Programs Assessment

| Program | Necessity | Recommendation |
|---------|-----------|----------------|
| Flow Launcher | High — dev productivity tool | Keep |
| Bitdefender VPN | Medium — use when needed | Keep or delay-start |
| Steam | Low during dev work | Disable from startup |
| uTorrent | Low + opens P2P ports | **Disable from startup** |
| SecurityHealth | Required | Keep |

### How to remove uTorrent + Steam from startup:
```powershell
# Open Task Manager > Startup tab and disable Steam and uTorrent
# OR use registry:
Remove-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "ut" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "Steam" -ErrorAction SilentlyContinue
```

---

## No Threats Found

- No crypto miners detected
- No suspicious hidden processes
- No fake activators or keyloggers found
- No browser hijackers in scheduled tasks
- No unexpected executables in startup paths
