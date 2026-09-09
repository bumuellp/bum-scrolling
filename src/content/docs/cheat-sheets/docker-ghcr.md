---
title: OCI Containers, Podman & Docker Cheat-Sheet
description: Engine-agnostic guide covering Podman, Docker, Compose, GHCR, and safe storage cleanup.
---

This guide is **container engine agnostic** — commands apply equally to `podman` and `docker`. Where behavioral differences exist (such as rootless user namespaces or SELinux volume labels), engine-specific flags are highlighted.

> [!NOTE]
> **SELinux Notice**: On systems running SELinux (RHEL, Fedora, CentOS, AlmaLinux), bind-mounted host volumes will fail with `Permission denied` unless explicitly relabeled with `:z` (shared across multiple containers) or `:Z` (exclusive to a single container). For full labeling rules, AVC denial diagnosis, and troubleshooting, consult the [SELinux Administration Guide](/bum-scrolling/linux/selinux).

---

## 🎛️ Commonly Used Commands

### Running & Debugging Containers

```bash
# Run interactive container with current user UID (avoids root-owned file outputs)
# Docker:
docker run --rm -it -v "${PWD}:/workspace" -w /workspace -u "$(id -u):$(id -g)" <image> bash
# Podman (uses keep-id mapping):
podman run --rm -it -v "${PWD}:/workspace:z" -w /workspace --userns=keep-id <image> bash

# Inspect live container processes and resource consumption
docker stats --no-stream
podman top <container_name>

# Follow logs with timestamp and tail limit
docker logs -f --tail=100 --timestamps <container_name>

# Execute command inside a running container
docker exec -it <container_name> /bin/sh
```

### Hardware Device Passthrough (GPU & Vulkan)

```bash
# Pass DRI / KFD graphics compute nodes for Vulkan (e.g. llama-proxy / llama.cpp)
docker run -d \
  --name llama-proxy \
  -p 5002:5002 \
  --device /dev/dri:/dev/dri \
  --device /dev/kfd:/dev/kfd \
  ghcr.io/bumuellp/llama-proxy:latest
```

---

## 🐙 Compose Quick Reference (`docker compose` / `podman compose`)

```bash
# Start all services in the background
docker compose up -d

# View live consolidated service logs
docker compose logs -f --tail=100 <service_name>

# Restart a specific service without affecting others
docker compose restart <service_name>

# Rebuild images without utilizing cache
docker compose build --no-cache

# Safe teardown: stops and removes containers & networks (preserves volumes)
docker compose down

# DESTRUCTIVE teardown: stops containers and WIPES all named/anonymous volumes
docker compose down -v
```

---

## 🧹 Storage Inspection & Cleanup

### Inspecting Storage Usage

```bash
# Show disk space breakdown across containers, images, volumes, and build cache
docker system df
podman system df -v
```

### Targeted Safe Cleanup

```bash
# Remove only stopped containers (safe)
docker container prune -f

# Remove dangling (untagged <none>) images only (safe)
docker image prune -f

# Remove unused build cache
docker builder prune -f
```

---

## ⚠️ The Danger of `--volumes` and `-v`

> [!CAUTION]
> **Data Loss Hazard with Volume Pruning:**
> Commands like `docker system prune --volumes` or `docker compose down -v` permanently delete persistent storage volumes!
>
> - **`docker system prune`** (without `--volumes`): Only removes stopped containers, dangling networks, and untagged images. **Your named volumes remain safe.**
> - **`docker system prune --volumes`**: Permanently deletes **ALL** volumes not actively mounted by an active running container. If your database (Postgres, MariaDB, Redis) container is currently stopped, its entire database directory is wiped!
> - **`docker compose down -v`**: Destroys named volumes declared in `compose.yml`. Use plain `docker compose down` for normal teardown.

---

## 📦 GitHub Container Registry (GHCR)

### Authenticating

```bash
# Docker / Podman login with a GitHub Personal Access Token (read:packages / write:packages)
echo "$GHCR_TOKEN" | docker login ghcr.io -u <github-username> --password-stdin
```

### Tagging & Pulling Conventions

```bash
# Immutable exact patch release (deterministic)
docker pull ghcr.io/bumuellp/lint-tools:v1.0.1

# Floating major release tag (tracks latest v1.x)
docker pull ghcr.io/bumuellp/lint-tools:v1

# Floating latest tag (tracks latest main commit)
docker pull ghcr.io/bumuellp/lint-tools:latest
```

---

## 🔏 Container Signing, SBOM & Integrity Verification

### 1. Verifying Container Signatures (Cosign)

```bash
# Verify image signature with Cosign public key
cosign verify \
  --key cosign.pub \
  ghcr.io/bumuellp/lint-tools:v1.0.1

# Keyless verification using GitHub Actions OIDC identity
cosign verify \
  --certificate-identity-regexp "https://github.com/bumuellp/.*" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ghcr.io/bumuellp/lint-tools:v1.0.1
```

### 2. Software Bill of Materials (SBOM) & Attestations

```bash
# Download and view attached SBOM from registry using Cosign
cosign download sbom ghcr.io/bumuellp/lint-tools:v1.0.1

# Verify SLSA Provenance or CycloneDX SBOM attestation
cosign verify-attestation \
  --type cyclonedx \
  --certificate-identity-regexp "https://github.com/bumuellp/.*" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ghcr.io/bumuellp/lint-tools:v1.0.1

# Generate CycloneDX SBOM locally with Syft
syft packages ghcr.io/bumuellp/lint-tools:latest -o cyclonedx-json > sbom.json

# Scan container SBOM with Trivy
trivy sbom sbom.json
```

### 3. Immutable Digest Pinning

```bash
# Inspect image to retrieve exact immutable repo digest (SHA256)
docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/bumuellp/lint-tools:v1.0.1

# Run container pinned by cryptographic hash (prevents tag hijacking / tampering)
docker run --rm \
  ghcr.io/bumuellp/lint-tools@sha256:4f3a8b...
```
