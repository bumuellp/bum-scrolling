---
title: UFW Firewall Cheat Sheet
description: High-density command reference for UFW rules, status inspection, port management, rate limiting, and subnet access control.
sidebar:
  label: "UFW Firewall"
  order: 50
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Runbook: Docker UFW Routing](./docker-ufw-runbook.md) · [Runbook: Kubernetes UFW Routing](./k8s-ufw-routing-runbook.md) · [Cheat Sheet: SSH & Remote Access](./ssh-cheatsheet.md) · [Runbook: WireGuard Routing & Hardening](./wireguard-routing-runbook.md)

This reference covers everyday `ufw` syntax, rule inspection with index numbers, port and protocol declarations, brute-force rate limiting, and subnet filtering.

---

## ⚡ Quick Start & Core Commands

```bash
# Enable firewall and enforce on system boot
sudo ufw enable

# Inspect rules with index numbers (required for precise deletion)
sudo ufw status numbered

# Allow incoming SSH and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 443/tcp

# Rate-limit SSH to prevent brute-force attacks
sudo ufw limit 22/tcp

# Allow traffic from trusted subnet to specific port
sudo ufw allow from 10.0.0.0/24 to any port 6443 proto tcp

# Delete rule by index number
sudo ufw delete 3

# Reload rules without restarting firewall service
sudo ufw reload
```

---

## 📊 Command & Flag Matrix

| Command / Flag             | Syntax                                      | Purpose / When Useful                                                     |
| :------------------------- | :------------------------------------------ | :------------------------------------------------------------------------ |
| **`enable` / `disable`**   | `sudo ufw enable`                           | Activates or deactivates UFW and the underlying Netfilter hooks.          |
| **`status numbered`**      | `sudo ufw status numbered`                  | Lists all active rules with bracketed numerical IDs.                      |
| **`status verbose`**       | `sudo ufw status verbose`                   | Shows default incoming/outgoing policies and interface bindings.          |
| **`allow <port>/<proto>`** | `sudo ufw allow 80/tcp`                     | Opens inbound port for specified transport protocol.                      |
| **`limit <port>/<proto>`** | `sudo ufw limit 22/tcp`                     | Rejects connections from an IP making 6+ connections in 30 seconds.       |
| **`allow from <CIDR>`**    | `sudo ufw allow from 192.168.1.0/24`        | Whitelists all ports for a specific source network range.                 |
| **`allow in on <iface>`**  | `sudo ufw allow in on wg0 to any port 6443` | Restricts access exclusively to a designated network interface.           |
| **`delete <number>`**      | `sudo ufw delete 2`                         | Removes rule matching the specified index number from status list.        |
| **`delete allow <rule>`**  | `sudo ufw delete allow 80/tcp`              | Removes rule by syntax specification.                                     |
| **`reload`**               | `sudo ufw reload`                           | Flushes and reapplies rules from `/etc/ufw/` without disrupting sessions. |

---

## 🛠️ Common Patterns & Workflows

### Inspecting Rules Safely

Before deleting or reordering rules, always check their numbered positions:

```bash
sudo ufw status numbered
```

Output example:

```text
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     LIMIT IN    Anywhere
[ 2] 443/tcp                    ALLOW IN    Anywhere
[ 3] 6443/tcp on wg0            ALLOW IN    Anywhere
```

Delete by number:

```bash
sudo ufw delete 2
```

### Granular Interface and Protocol Rules

```bash
# Allow Kubernetes API traffic strictly on the WireGuard tunnel
sudo ufw allow in on wg0 to any port 6443 proto tcp

# Explicitly reject API traffic arriving from WAN
sudo ufw deny in on eth0 to any port 6443 proto tcp

# Allow UDP telemetry or VPN traffic
sudo ufw allow 51820/udp
```

### Resetting and Hardening Default Policies

```bash
# Set baseline security policies: drop all unexpected ingress, allow egress
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Reload firewall to enforce
sudo ufw reload
```

---

## 🔗 Related Documentation & Context

- [Runbook: Docker UFW Routing](./docker-ufw-runbook.md)
- [Runbook: Kubernetes UFW Routing](./k8s-ufw-routing-runbook.md)
- [Cheat Sheet: SSH & Remote Access](./ssh-cheatsheet.md)
- [Runbook: WireGuard Routing & Hardening](./wireguard-routing-runbook.md)
- [Architecture: Kubernetes Host Networking & MTU](../containers/k8s-networking-explanation.md)
