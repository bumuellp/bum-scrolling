---
title: "[Operation / Procedure Name] Runbook"
description: "Step-by-step operational runbook for configuring, securing, and maintaining [System / Service]."
---

<!--
DIÁTAXIS ARCHETYPE: HOW-TO GUIDE / RUNBOOK
Target Audience: Practitioners executing a concrete operational task or solving a specific production problem.
Tone: Prescriptive, sequential, action-driven, outcome-focused.
-->

> 🔗 **Related**: [Cheat Sheet: Quick Reference](../path/to/cheatsheet.md) · [Architecture: System Topology](../path/to/architecture.md)

[1-2 sentences stating exactly what operational goal this runbook accomplishes and the target environment].

---

## 📋 Prerequisites & Requirements

Before starting this procedure, ensure the following conditions are met:

- [ ] Target OS / Distribution: [e.g. Ubuntu 24.04 LTS / Debian 12 / Rocky Linux 9]
- [ ] Required packages / tools installed: `[tool1]`, `[tool2]`
- [ ] Network / Port access: [e.g. Inbound UDP 51820 allowed]
- [ ] Root or `sudo` privileges on the host

---

## 🚀 Step-by-Step Procedure

### Step 1: [Prepare the Environment / Host Configuration]

[Brief explanation of why this step is performed].

```bash
# Execute preparation commands
sudo apt-get update && sudo apt-get install -y [package-name]
```

### Step 2: [Apply Configuration]

Create or edit the configuration file at `[path/to/config]`:

```yaml
# /path/to/config.yaml
service:
  interface: "0.0.0.0"
  port: 8080
  logging:
    level: "info"
```

<details>
<summary>Alternative Configuration: [Advanced or Edge-Case Setup]</summary>

If deploying in a high-availability cluster or behind an existing reverse proxy, use this alternative configuration:

```yaml
service:
  interface: "127.0.0.1"
  cluster:
    peer: "10.10.0.2:8080"
```

</details>

### Step 3: [Initialize or Reload Service]

```bash
# Reload systemd daemon and restart the unit
sudo systemctl daemon-reload
sudo systemctl enable --now [service-name].service
```

---

## ✅ Verification & Health Checks

Confirm that the system operates as expected:

```bash
# 1. Verify service status
sudo systemctl status [service-name].service --no-pager

# 2. Check active network listeners
ss -tulpn | grep [port]

# 3. Test connectivity or ping check
curl -fsSL http://localhost:8080/healthz
```

---

## 🔍 Troubleshooting & Incident Response

### Common Failure Modes

#### Issue: [Symptom Name, e.g. Port Binding Failed]

- **Cause**: [Root cause explanation, e.g. Port already allocated by another daemon].
- **Remedy**:

  ```bash
  sudo lsof -i :8080
  ```

#### Issue: [Symptom Name, e.g. Permission Denied]

- **Cause**: [Root cause explanation, e.g. SELinux context or file ownership mismatch].
- **Remedy**:

  ```bash
  sudo chown -R service-user:service-group /var/lib/service
  ```

---

## 🛡️ Security Hardening Checklist

> [!IMPORTANT]
>
> - Never expose unauthenticated admin or debug ports to WAN interfaces.
> - Ensure sensitive configuration files are restricted (`chmod 600`).

---

## 🔗 Related Documentation & Context

- **Cheat Sheet**: [CLI Command Reference](../path/to/cheatsheet.md) — Rapid lookups for flags and everyday commands.
- **Architecture**: [Topology & Rationale](../path/to/architecture.md) — System models, failure modes, and architectural trade-offs.
