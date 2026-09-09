---
title: SSH & Remote Access Cheat-Sheet
description: Comprehensive SSH reference covering Ed25519 key generation, jumphosts, ~/.ssh/config aliases, and tunneling.
---

## 🔑 Key Generation & Transfer

### Generating Modern Keys (Ed25519)

```bash
# Generate high-security Ed25519 key pair with comment
ssh-keygen -t ed25519 -C "admin@workstation" -f ~/.ssh/id_ed25519

# Generate fallback 4096-bit RSA key (only for legacy appliances)
ssh-keygen -t rsa -b 4096 -C "admin@legacy"
```

### Deploying Public Keys to Remote Hosts

```bash
# Standard copy to default SSH port
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote-host.example.com

# Deploy to custom SSH port
ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 2222 user@remote-host.example.com

# Manual fallback (when ssh-copy-id is unavailable)
cat ~/.ssh/id_ed25519.pub | ssh user@remote-host.example.com "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

---

## 🧭 Jumphosts & Bastion Forwarding

### Ad-Hoc Jumphost Command (`-J`) with Custom Ports

```bash
# Connect to private internal host (port 22) via bastion on custom port (port 2222)
ssh -J bastion-user@bastion.example.com:2222 target-user@10.0.0.45

# Bastion on standard port (22) jumping to target on custom port (22222)
ssh -J bastion-user@bastion.example.com -p 22222 target-user@10.0.0.45

# Both bastion and target on non-standard ports (bastion:2222 -> target:22022)
ssh -J bastion-user@bastion.example.com:2222 -p 22022 target-user@10.0.0.45

# Multi-hop jump with differing ports (jump1:2222 -> jump2:2223 -> target:22)
ssh -J jumpuser@jump1.example.com:2222,admin@jump2.internal.lan:2223 target-user@10.0.0.45
```

---

## ⚙️ SSH Client Configuration (`~/.ssh/config`)

Organizing connections in `~/.ssh/config` eliminates tedious flags and sets persistent keepalives:

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

Now connect simply by running:

```bash
ssh k8s-node1
```

---

## 🚇 SSH Port Forwarding & Tunnels

```bash
# Local Port Forwarding: Access remote service on local workstation (e.g. remote 5002 on local 8080)
ssh -L 8080:127.0.0.1:5002 user@remote-server

# Remote Port Forwarding: Expose local workstation port to remote server
ssh -R 9000:127.0.0.1:9000 user@remote-server

# Dynamic SOCKS5 Proxy (route browser traffic through remote host)
ssh -D 1080 -N -f user@remote-server
```
