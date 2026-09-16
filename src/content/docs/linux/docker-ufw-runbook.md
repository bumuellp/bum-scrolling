---
title: Docker UFW Bypass Remediation Runbook
description: Step-by-step operational runbook for mitigating Docker Netfilter chain bypasses using localhost port binding, ufw-docker, or rootless Podman.
sidebar:
  label: "Docker UFW Remediation"
  order: 60
  badge:
    text: "Runbook"
    variant: "success"
---

> 🔗 **Related**: [Cheat Sheet: UFW Firewall](./ufw-cheatsheet.md) · [Cheat Sheet: Container Engines](../containers/container-engines-cheatsheet.md) · [Runbook: Kubernetes UFW Routing](./k8s-ufw-routing-runbook.md)

By default, Docker manipulates Linux host `iptables` directly by injecting rules into the `PREROUTING` and `DOCKER` chains. These chains execute **before** UFW's incoming filter rules. Running `docker run -p 8080:80 nginx` exposes port 8080 directly to the public internet, completely bypassing `ufw default deny incoming`. This runbook outlines three operational solutions to enforce firewall boundaries.

---

## 📋 Prerequisites & Requirements

Before starting this procedure, ensure the following conditions are met:

- [ ] Linux host (Ubuntu or Debian) with `ufw` enabled (`sudo ufw status`)
- [ ] Docker Engine installed and running
- [ ] Administrative `sudo` privileges on the host

---

## 🛠️ Remediation Strategy 1: Explicit Localhost Binding

When containers sit behind a local reverse proxy (such as Nginx, Traefik, or Caddy), bind published ports strictly to `127.0.0.1`. Docker then ignores packets originating from external interfaces:

### Ad-Hoc CLI Execution

```bash
docker run -d --name web -p 127.0.0.1:8080:80 nginx:alpine
```

### Declarative Compose Stack (`compose.yaml`)

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "127.0.0.1:8080:80"
```

---

## 🛠️ Remediation Strategy 2: Intercepting Traffic via `ufw-docker`

If containers must be published to external clients and you need UFW to manage port access, use the `ufw-docker` utility to populate the `DOCKER-USER` chain.

### 1. Install & Verify `ufw-docker`

```bash
# Download pinned release script
sudo wget -O /usr/local/bin/ufw-docker \
  https://raw.githubusercontent.com/chaifeng/ufw-docker/020a8699f95592561f254d8d4ad1bb40d401dfc7/ufw-docker

# Verify SHA256 checksum before granting execute permissions
echo "643e56b080567c567b4aa28650196849b2a2da5dd0473fd3e5216b0886035ab0  /usr/local/bin/ufw-docker" | sha256sum --check

sudo chmod +x /usr/local/bin/ufw-docker
```

### 2. Patch UFW Configuration

```bash
# Injects DOCKER-USER rules into /etc/ufw/after.rules
sudo ufw-docker install

# Reload firewall to apply modifications
sudo ufw reload
```

### 3. Expose Ports Selectively

```bash
# Allow public access to container 'web' on port 80
sudo ufw-docker allow web 80

# Allow access to port 443 strictly from a trusted administrative IP
sudo ufw-docker allow web 443 from 198.51.100.25

# Inspect active ufw-docker rules
sudo ufw-docker status
```

---

## 🛠️ Remediation Strategy 3: Switch to Rootless Podman

Rootless Podman executes entirely inside unprivileged user namespaces and does not manipulate host Netfilter chains. Traffic routes through user-space network proxies (`pasta` or `slirp4netns`), eliminating the UFW bypass hazard by design:

```bash
# Standard user-space port binding respects host UFW policies
podman run -d --name web -p 8080:80 nginx:alpine
```

---

## ✅ Verification

Verify that unpublished ports reject external traffic:

```bash
# From an external workstation, test connection to Docker host IP
curl -v --connect-timeout 5 http://<docker_host_ip>:8080

# Output should time out or return Connection Refused if not explicitly permitted in UFW
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: UFW Firewall](./ufw-cheatsheet.md)
- [Runbook: Kubernetes UFW Routing](./k8s-ufw-routing-runbook.md)
- [Cheat Sheet: Container Engines](../containers/container-engines-cheatsheet.md)
- [Cheat Sheet: Docker & Podman Compose](../containers/compose-cheatsheet.md)
