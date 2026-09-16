---
title: SSH & Remote Access Cheat Sheet
description: High-density SSH reference covering Ed25519 key generation, jumphosts, ~/.ssh/config aliases, and tunneling.
sidebar:
  label: "SSH & Remote Access"
  order: 10
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: Users, Permissions & sudo](./user-permissions-cheatsheet.md) · [Cheat Sheet: UFW Firewall](./ufw-cheatsheet.md) · [Runbook: WireGuard Routing & Hardening](./wireguard-routing-runbook.md)

This reference covers SSH key lifecycle management, remote public key deployment, multi-hop bastion jumphosts, declarative client configuration in `~/.ssh/config`, and port forwarding tunnels.

---

## ⚡ Quick Start & Core Commands

```bash
# Generate high-security Ed25519 key pair with comment
ssh-keygen -t ed25519 -C "admin@workstation" -f ~/.ssh/id_ed25519

# Deploy public key to remote host on default port
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote-host.example.com

# Deploy public key to remote host on custom port
ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 2222 user@remote-host.example.com

# Connect via bastion jumphost using -J flag
ssh -J bastion-user@bastion.example.com:2222 target-user@10.0.0.45

# Local port forwarding: bind remote port 5002 to local workstation port 8080
ssh -L 8080:127.0.0.1:5002 user@remote-server

# Remote port forwarding: expose local port 9000 on remote server
ssh -R 9000:127.0.0.1:9000 user@remote-server
```

---

## 📊 Command & Flag Matrix

| Command / Flag                   | Syntax                                           | Purpose / When Useful                                                                   |
| :------------------------------- | :----------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **`-t ed25519`**                 | `ssh-keygen -t ed25519 -C "mail@domain"`         | Generates modern elliptic-curve key with small footprint and high security.             |
| **`-t rsa -b 4096`**             | `ssh-keygen -t rsa -b 4096 -C "comment"`         | Generates 4096-bit RSA key for legacy appliances lacking Ed25519 support.               |
| **`ssh-copy-id`**                | `ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host` | Installs public key to remote user `~/.ssh/authorized_keys` with correct permissions.   |
| **`-J` (ProxyJump)**             | `ssh -J jumpuser@bastion:2222 targetuser@host`   | Bounces SSH session through one or more intermediate bastion hosts.                     |
| **`-p <port>`**                  | `ssh -p 2222 user@host`                          | Connects to a non-standard SSH daemon listening port.                                   |
| **`-L <local>:<host>:<remote>`** | `ssh -L 8080:127.0.0.1:5002 user@server`         | Forwards local port to remote destination (access private databases or web UIs).        |
| **`-R <remote>:<host>:<local>`** | `ssh -R 9000:127.0.0.1:9000 user@server`         | Forwards remote port back to local workstation (webhook debugging, sharing dev server). |
| **`-D <port>`**                  | `ssh -D 1080 -N -f user@server`                  | Opens dynamic SOCKS5 proxy routed through remote host without opening shell.            |

---

## 🛠️ Common Patterns & Workflows

### Manual Public Key Installation Fallback

When `ssh-copy-id` is unavailable on the local client:

```bash
cat ~/.ssh/id_ed25519.pub | ssh user@remote-host.example.com \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### Multi-Hop Bastion Routing

Connect across multiple cascaded jumphosts:

```bash
# Cascade: jump1 (port 2222) -> jump2 (port 2223) -> target internal node (port 22)
ssh -J jumpuser@jump1.example.com:2222,admin@jump2.internal.lan:2223 target-user@10.0.0.45

# Both bastion and target on custom non-standard ports
ssh -J bastion-user@bastion.example.com:2222 -p 22022 target-user@10.0.0.45
```

### Declarative Client Configuration (`~/.ssh/config`)

Centralizing hosts in `~/.ssh/config` eliminates repeated command-line flags and configures persistent keepalives:

```ini
# Global defaults applied to all connections
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    AddKeysToAgent yes
    IdentitiesOnly yes
    Compression yes

# Bastion / Jump Host
Host bastion
    HostName bastion.example.com
    User jumpuser
    Port 2222
    IdentityFile ~/.ssh/id_ed25519

# Internal Server routed automatically through Bastion
Host k8s-node1
    HostName 10.0.1.10
    User deployer
    IdentityFile ~/.ssh/id_internal
    ProxyJump bastion

# Direct connection with custom port and alias
Host storage
    HostName nas.local.lan
    User admin
    Port 22022
    IdentityFile ~/.ssh/id_storage
```

Connect directly using configured aliases:

```bash
ssh k8s-node1
```

### Background Dynamic SOCKS5 Proxy

Route workstation browser or curl traffic through a remote cloud host:

```bash
# -D 1080: SOCKS proxy port
# -N: Do not execute a remote command (port forward only)
# -f: Fork into background
ssh -D 1080 -N -f user@remote-server

# Test proxy routing
curl --socks5-hostname 127.0.0.1:1080 https://ifconfig.me
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: Users, Permissions & sudo](./user-permissions-cheatsheet.md)
- [Cheat Sheet: UFW Firewall](./ufw-cheatsheet.md)
- [Runbook: WireGuard Routing & Hardening](./wireguard-routing-runbook.md)
