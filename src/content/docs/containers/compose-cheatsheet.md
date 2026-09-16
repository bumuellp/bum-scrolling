---
title: Docker & Podman Compose Cheat Sheet
description: Practical command reference for Docker and Podman Compose service lifecycles, log inspection, rebuilds, and secure compose definitions.
sidebar:
  label: "Compose Reference"
  order: 20
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: Container Engines](./container-engines-cheatsheet.md) · [Runbook: Container Image Security](./image-security-runbook.md)

Commands apply equally to `docker compose` and `podman compose`.

---

## ⚡ Quick Start & Core Commands

```bash
# Start all services in background
docker compose up -d

# View live consolidated service logs with line limit
docker compose logs -f --tail=100 <service_name>

# Restart a specific service without affecting others
docker compose restart <service_name>

# Rebuild images without utilizing cache
docker compose build --no-cache

# Safe teardown: stops and removes containers and networks (preserves volumes)
docker compose down

# Destructive teardown: stops containers and WIPES all named and anonymous volumes
docker compose down -v
```

---

## 📊 Command Matrix

| Command                | Syntax                                   | Purpose / When Useful                                                             |
| :--------------------- | :--------------------------------------- | :-------------------------------------------------------------------------------- |
| **`up -d`**            | `docker compose up -d`                   | Provisions networks, volumes, and starts all declared services in background.     |
| **`down`**             | `docker compose down`                    | Stops and removes containers and networks while keeping volumes intact.           |
| **`down -v`**          | `docker compose down -v`                 | **Destructive**: Removes containers, networks, and deletes all declared volumes.  |
| **`logs -f`**          | `docker compose logs -f --tail=50 <svc>` | Streams real-time logs for a specific service.                                    |
| **`restart`**          | `docker compose restart <svc>`           | Restarts a single container without rebuilding images or resetting network links. |
| **`build --no-cache`** | `docker compose build --no-cache`        | Forces full fresh image rebuild from source Containerfiles.                       |
| **`exec`**             | `docker compose exec <svc> sh`           | Opens interactive terminal inside the service container.                          |
| **`ps`**               | `docker compose ps`                      | Lists status, ports, and healthcheck states of services.                          |

---

## ⚙️ Hardened Production Service Definition

Example service definition incorporating unprivileged execution (`1000:1000`), read-only root filesystems, and shared SELinux volume relabeling (`:z`):

```yaml
# compose.yaml
services:
  web:
    image: ghcr.io/bumuellp/vibe-trading:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
    user: "1000:1000"
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid
    volumes:
      - data-volume:/app/data:z

volumes:
  data-volume:
    name: vibe-data
```

---

## ⚠️ Gotchas & Best Practices

> [!CAUTION]
> **Avoid `docker compose down -v` in production:**
> Appending `-v` instructs Compose to delete every volume declared under the top-level `volumes:` key. Databases, caches, and persistent state directories are completely wiped. Use plain `docker compose down` for routine maintenance.

Pay careful attention to network exposure:

> [!TIP]
> Always bind published ports to `127.0.0.1` (e.g. `127.0.0.1:8080:80`) when deploying behind a reverse proxy (such as Traefik, Caddy, or Nginx) to prevent direct internet exposure.

---

## 🔗 Related Documentation & Context

- **Cheat Sheet**: [Container Engines](./container-engines-cheatsheet.md): Podman and Docker CLI commands, user namespaces, and storage management.
- **Runbook**: [Container Image Security](./image-security-runbook.md): Cosign signatures, SBOM verification, and immutable digests.
- **Runbook**: [SELinux Administration](../linux/selinux-runbook.md): Host volume relabeling and container context diagnosis.
