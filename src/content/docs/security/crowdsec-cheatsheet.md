---
title: CrowdSec CLI (cscli) Cheat Sheet
description: High-density command reference for CrowdSec decision management, IP bans, alert forensics, bouncer registration, and Hub collection updates.
sidebar:
  label: "CrowdSec CLI (cscli)"
  order: 10
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Runbook: CrowdSec Operations & Triage](./crowdsec-operations-runbook.md) · [Architecture: CrowdSec Multi-Tier Defense](./crowdsec-architecture-explanation.md) · [Cheat Sheet: UFW Firewall](../linux/ufw-cheatsheet.md)

CrowdSec detects threats through distributed log parsing and behavioral scenarios. This reference covers everyday `cscli` syntax for managing remediation bans, inspecting security alerts, registering bouncers, and updating detection hubs.

---

## ⚡ Quick Start & Core Commands

```bash
# List all active remediation decisions and IP bans
cscli decisions list

# Manually ban an abusive IP for 24 hours with a reason
cscli decisions add --ip 198.51.100.42 --duration 24h --reason "Port scanning"

# Unban an IP address
cscli decisions delete --ip 198.51.100.42

# View recent alert log events
cscli alerts list --limit 20

# View real-time log ingestion and scenario evaluation metrics
cscli metrics

# Update Hub index and upgrade all installed collections
cscli hub update && cscli hub upgrade
```

---

## 📊 Command & Subcommand Matrix

| Subcommand                  | Syntax                                      | Purpose / When Useful                                                |
| :-------------------------- | :------------------------------------------ | :------------------------------------------------------------------- |
| **`decisions list`**        | `cscli decisions list`                      | Displays active bans with origin, duration, and scenario.            |
| **`decisions add --ip`**    | `cscli decisions add --ip <IP> -d 24h`      | Manually enforces a timed block on a single IP address.              |
| **`decisions add --range`** | `cscli decisions add --range <CIDR> -d 48h` | Bans an entire abusive subnet.                                       |
| **`decisions delete --ip`** | `cscli decisions delete --ip <IP>`          | Revokes an active ban on an IP address.                              |
| **`decisions delete --id`** | `cscli decisions delete --id <ID>`          | Clears a specific ban by its database ID.                            |
| **`alerts list`**           | `cscli alerts list --limit 50`              | Summarizes recent detection events with source IP and timestamps.    |
| **`alerts inspect`**        | `cscli alerts inspect <ID>`                 | Dumps full forensic event data for an alert.                         |
| **`metrics`**               | `cscli metrics`                             | Displays acquisition, parser, and scenario hit counters.             |
| **`bouncers list`**         | `cscli bouncers list`                       | Lists registered remediation components and last poll times.         |
| **`bouncers add`**          | `cscli bouncers add <name>`                 | Generates an API key to connect a new firewall or WAF bouncer.       |
| **`bouncers prune`**        | `cscli bouncers prune -d 10m`               | Removes stale bouncer registrations from dynamic container restarts. |
| **`bouncers delete`**       | `cscli bouncers delete <name>`              | Deletes an obsolete bouncer from the Local API.                      |
| **`machines list`**         | `cscli machines list`                       | Lists registered local and remote engine instances.                  |
| **`collections install`**   | `cscli collections install <slug>`          | Installs community parsers and scenarios for a service.              |

---

## 🛠️ Common Patterns & Workflows

### Manual Subnet & IP Remediation

```bash
# Ban suspicious CIDR block for 48 hours
cscli decisions add --range 198.51.100.0/24 --duration 48h --reason "Brute-force flood"

# Delete ban by decision ID
cscli decisions delete --id 402
```

### Registering Remediation Bouncers

```bash
# Register a host firewall bouncer and capture API token
cscli bouncers add host-firewall-bouncer

# Register Traefik or reverse proxy WAF plugin
cscli bouncers add traefik-waf-plugin
```

### Essential Security Collections

Install official collections tailored to Linux servers, SSH daemons, and reverse proxies:

```bash
# Core Linux OS and SSH brute-force protection
cscli collections install crowdsecurity/linux
cscli collections install crowdsecurity/sshd

# Reverse proxy access log inspection
cscli collections install crowdsecurity/traefik

# AppSec virtual patching (blocks active CVE probes and exploits)
cscli collections install crowdsecurity/appsec-virtual-patching
```

### Upstream Intelligence & Health Verification

```bash
# Verify Local API (LAPI) health endpoint
curl -s http://127.0.0.1:8080/v1/health

# Check Central API (CAPI) upstream synchronization
cscli capi status

# Check CrowdSec Console connectivity
cscli console status
```

---

## 🔗 Related Documentation & Context

- [Runbook: CrowdSec Operations & Triage](./crowdsec-operations-runbook.md)
- [Architecture: CrowdSec Multi-Tier Defense](./crowdsec-architecture-explanation.md)
- [Cheat Sheet: UFW Firewall](../linux/ufw-cheatsheet.md)
- [Runbook: Docker UFW Routing](../linux/docker-ufw-runbook.md)
- [Runbook: Kubernetes UFW Routing](../linux/k8s-ufw-routing-runbook.md)
- [CrowdSec Official Documentation](https://docs.crowdsec.net/)
