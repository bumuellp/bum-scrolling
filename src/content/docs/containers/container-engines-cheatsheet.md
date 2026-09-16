---
title: Container Engines Cheat Sheet
description: High-density command reference for Podman and Docker execution, SELinux volume labels, GPU passthrough, and safe storage cleanup.
sidebar:
  label: "Container Engines"
  order: 10
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: Docker & Podman Compose](./compose-cheatsheet.md) · [Runbook: Container Image Security](./image-security-runbook.md) · [Runbook: SELinux Remediation](../linux/selinux-runbook.md)

Commands apply equally to `podman` and `docker`. Where behavioral differences exist (such as rootless user namespaces or SELinux volume labels), engine-specific flags are noted.

---

## ⚡ Quick Start & Core Commands

```bash
# Run interactive container matching host user UID (avoids root-owned file outputs)
# Docker:
docker run --rm -it -v "${PWD}:/workspace" -w /workspace -u "$(id -u):$(id -g)" <image> bash
# Podman (uses keep-id mapping):
podman run --rm -it -v "${PWD}:/workspace:z" -w /workspace --userns=keep-id <image> bash

# Inspect live container resource consumption
docker stats --no-stream
podman top <container_name>

# Follow logs with timestamps and line limit
docker logs -f --tail=100 --timestamps <container_name>

# Execute interactive shell inside running container
docker exec -it <container_name> /bin/sh
```

---

## 📊 Command & Flag Matrix

| Command / Flag         | Syntax                                  | Purpose / When Useful                                                                         |
| :--------------------- | :-------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **`-u UID:GID`**       | `docker run -u "$(id -u):$(id -g)" ...` | Runs container process as current host user to prevent root-owned output files.               |
| **`--userns=keep-id`** | `podman run --userns=keep-id ...`       | Maps host user UID directly into the rootless Podman user namespace.                          |
| **`:z`**               | `-v /host/path:/container/path:z`       | Relabels bind mount with shared SELinux context (`container_file_t`) for multiple containers. |
| **`:Z`**               | `-v /host/path:/container/path:Z`       | Relabels bind mount with exclusive private SELinux context.                                   |
| **`--device`**         | `--device /dev/dri:/dev/dri`            | Passes hardware render nodes to container for GPU or Vulkan compute.                          |
| **`system df`**        | `docker system df`                      | Displays disk breakdown across containers, images, volumes, and cache.                        |
| **`container prune`**  | `docker container prune -f`             | Safely removes stopped containers without touching images or volumes.                         |
| **`image prune`**      | `docker image prune -f`                 | Deletes dangling, untagged (`<none>`) image layers.                                           |
| **`builder prune`**    | `docker builder prune -f`               | Clears Buildx build cache.                                                                    |

---

## 🛠️ Common Patterns & Workflows

### 1. Hardware Device Passthrough (GPU & Vulkan)

Pass DRI and KFD compute nodes into containers for local LLM inference engines (such as `llama-proxy`):

```bash
docker run -d \
  --name llama-proxy \
  -p 5002:5002 \
  --device /dev/dri:/dev/dri \
  --device /dev/kfd:/dev/kfd \
  ghcr.io/bumuellp/llama-proxy:latest
```

### 2. Targeted Safe Storage Cleanup

Inspect storage consumption before cleaning:

```bash
# Inspect disk breakdown
docker system df
podman system df -v

# Remove stopped containers
docker container prune -f

# Remove dangling untagged images only
docker image prune -f

# Remove unused build cache
docker builder prune -f
```

---

## ⚠️ Gotchas & Best Practices

> [!CAUTION]
> **Data Loss Risk with Volume Pruning:**
> Commands like `docker system prune --volumes` or `docker compose down -v` permanently delete persistent storage volumes.
>
> - `docker system prune`: Only removes stopped containers, dangling networks, and untagged images. Named volumes remain safe.
> - `docker system prune --volumes`: Permanently deletes **all** volumes not actively mounted by a running container. If a database container is stopped, its entire data directory is wiped.

Pay careful attention to host volume permissions on security-hardened kernels:

> [!NOTE]
> On systems running SELinux (RHEL, Fedora, CentOS, AlmaLinux), bind-mounted host volumes return `Permission denied` unless explicitly relabeled with `:z` (shared) or `:Z` (exclusive). Consult the [SELinux Remediation Runbook](../linux/selinux-runbook.md) for full context rules.

---

## 🔗 Related Documentation & Context

- **Cheat Sheet**: [Docker & Podman Compose](./compose-cheatsheet.md): Multi-container definitions and lifecycle commands.
- **Runbook**: [Container Image Security](./image-security-runbook.md): Cosign verification, SBOM scanning, and digest pinning.
- **Runbook**: [SELinux Remediation](../linux/selinux-runbook.md): Host file contexts and container volume labels.
