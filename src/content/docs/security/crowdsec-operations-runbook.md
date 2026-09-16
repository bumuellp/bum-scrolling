---
title: CrowdSec Operations & Triage Runbook
description: Step-by-step operational runbook for CrowdSec health checks, zero-risk log simulation, remediation testing, rootless log permissions, and bouncer diagnostics.
sidebar:
  label: "CrowdSec Operations"
  order: 20
  badge:
    text: "Runbook"
    variant: "success"
---

> 🔗 **Related**: [Cheat Sheet: CrowdSec CLI (cscli)](./crowdsec-cheatsheet.md) · [Architecture: CrowdSec Multi-Tier Defense](./crowdsec-architecture-explanation.md) · [Runbook: Docker UFW Routing](../linux/docker-ufw-runbook.md)

This runbook guides engineers through verifying CrowdSec engine health, simulating detection scenarios without live malicious traffic, testing end-to-end packet drops and HTTP 403 blocks, and resolving rootless container permission constraints.

---

## 📋 Prerequisites & Requirements

Before starting this procedure, ensure the following conditions are met:

- [ ] Linux host running CrowdSec Security Engine (bare-metal service or container)
- [ ] At least one active remediation bouncer registered (`cscli bouncers list`)
- [ ] Administrative or `sudo` access to the host

---

## 🧪 Step 1: Zero-Risk Log Parsing Simulation (`cscli explain`)

Before testing with live traffic, verify that parsers and scenarios trigger correctly using `cscli explain`. For official detection checks and additional scenario examples, refer to the [CrowdSec Health Check Documentation](https://docs.crowdsec.net/u/getting_started/health_check/).

### Test Web Sensitive Path Probing (`.env` Probing)

```bash
cscli explain --type nginx \
  --log '198.51.100.25 - - [09/Sep/2026:12:00:00 +0000] "GET /.env HTTP/1.1" 404 153 "-" "curl/7.68.0"'
```

### Test Bad User-Agent Scanner Detection

```bash
cscli explain --type nginx \
  --log '198.51.100.25 - - [09/Sep/2026:12:00:00 +0000] "GET / HTTP/1.1" 200 1200 "-" "Nikto"'
```

### Test SSH Failed Authentication

```bash
cscli explain --type syslog \
  --log 'Sep 09 12:00:00 ubuntu sshd[12345]: Failed password for invalid user admin from 198.51.100.25 port 54321 ssh2'
```

---

## 🚀 Step 2: End-to-End Remediation Verification

Verify that an active decision successfully propagates from the Local API down to host firewalls and reverse proxies:

### 1. Enforce a Temporary Test Ban

```bash
# Add temporary 5-minute ban for a test IP
cscli decisions add --ip 198.51.100.42 --duration 5m --reason "manual-verification"
```

### 2. Verify Kernel Firewall Enforcement (Layer 3/4)

Check that the firewall bouncer populated the IP in `ipset` or `iptables`:

```bash
# Verify with ipset directly
sudo ipset test crowdsec-blacklists-4 198.51.100.42

# Inspect the Netfilter chain packet counters
sudo iptables -L CROWDSEC_CHAIN -v -n
```

### 3. Verify Reverse Proxy WAF Enforcement (Layer 7)

Send a simulated HTTP request containing the banned IP in the forwarded header:

```bash
curl -I -H "X-Forwarded-For: 198.51.100.42" https://service.example.com
```

The reverse proxy should immediately return `HTTP/1.1 403 Forbidden` or a CAPTCHA challenge.

### 4. Clean Up the Test Decision

```bash
cscli decisions delete --ip 198.51.100.42
```

---

## 🩺 Step 3: Troubleshooting & Failure Modes

### 1. Permission Denied Reading Host Logs in Rootless Containers

- **Symptom**: CrowdSec container logs show `permission denied` reading `/var/log/auth.log` or `syslog`.
- **Cause**: Rootless Podman runs under an unprivileged host UID. Debian/Ubuntu system logs are restricted to `root:adm (0640)`.
- **Resolution**: Use POSIX Access Control Lists (ACLs) to grant the unprivileged user read permissions without weakening system file masks:

```bash
sudo apt-get install -y acl

# Grant read permission on active log files
sudo setfacl -m u:$USER:r /var/log/auth.log /var/log/syslog /var/log/ufw.log /var/log/kern.log

# Ensure future rotated logs inherit read permissions automatically
sudo setfacl -d -m u:$USER:r /var/log
```

---

### 2. Duplicate or Stale Bouncer Aliases (`FIREWALL@10.89.x.x`)

- **Symptom**: `cscli bouncers list` displays multiple obsolete bouncers with bridge IPs after container restarts.
- **Cause**: Dynamic bridge IP allocation causes LAPI to register new client identities.
- **Resolution**: Prune stale bouncers that have not polled within 10 minutes:

```bash
cscli bouncers prune -d 10m
```

---

### 3. Missing Acquisition Metrics

- **Symptom**: Configured log files or journal sources do not appear in `cscli metrics`.
- **Cause**: Acquisition metrics are held in-memory and reset when the daemon restarts. CrowdSec omits log sources from the metrics summary until at least 1 new log line has been ingested.
- **Resolution**: Generate a test log entry (such as an SSH attempt or HTTP request) and re-check `cscli metrics`.

---

### 4. Bouncer Connection Refused or 401 Unauthorized

- **Symptom**: Bouncer logs display `connection refused` or `401 Unauthorized` calling LAPI (`127.0.0.1:8080`).
- **Resolution**:
  1. Confirm the CrowdSec daemon is listening on port 8080 (`curl -s http://127.0.0.1:8080/v1/health`).
  2. Verify that the API token in `/etc/crowdsec/bouncers/crowdsec-firewall-bouncer.yaml` matches the key registered in `cscli bouncers list`.
  3. Re-register the bouncer if the key was lost:

```bash
cscli bouncers add host-firewall --key <NEW_SECRET_KEY>
sudo systemctl restart crowdsec-firewall-bouncer
```

---

### 5. Rootless Low-Port Binding Restrictions (Ports < 1024)

- **Symptom**: Traefik or reverse proxy fails with `bind: permission denied` on ports 80 or 443.
- **Resolution**: Lower the Linux kernel unprivileged port start threshold:

```bash
echo "net.ipv4.ip_unprivileged_port_start=22" | sudo tee /etc/sysctl.d/50-unprivileged-ports.conf
sudo sysctl --system
```

---

### 6. AppSec Resolver / Internal DNS Failures

- **Symptom**: Reverse proxy logs report `Security engine connection failed: crowdsec could not be resolved` or `recv() failed (111: Connection refused)`.
- **Cause**: In rootless container bridges (such as Netavark), DNS is hosted on the bridge gateway (`10.89.0.1:53`), unlike Docker's `127.0.0.11:53`. Public DNS upstreams will fail to resolve internal container hostnames.
- **Resolution**: Set the proxy's internal DNS resolver to the bridge gateway (e.g. `resolver 10.89.0.1 valid=30s ipv6=off;` in Nginx) or target the static container IP directly.

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: CrowdSec CLI (cscli)](./crowdsec-cheatsheet.md)
- [Architecture: CrowdSec Multi-Tier Defense](./crowdsec-architecture-explanation.md)
- [Cheat Sheet: UFW Firewall](../linux/ufw-cheatsheet.md)
- [Runbook: Docker UFW Routing](../linux/docker-ufw-runbook.md)
- [Runbook: Kubernetes UFW Routing](../linux/k8s-ufw-routing-runbook.md)
- [CrowdSec Official Documentation](https://docs.crowdsec.net/)
- [CrowdSec Health Check & Detection Guide](https://docs.crowdsec.net/u/getting_started/health_check/)
