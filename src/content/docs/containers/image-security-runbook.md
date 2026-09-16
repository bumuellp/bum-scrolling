---
title: Container Image Security Runbook
description: Step-by-step operational runbook for GHCR authentication, Cosign signature verification, Syft SBOM generation, Trivy scanning, and immutable digest pinning.
sidebar:
  label: "Image Security & SBOM"
  order: 30
  badge:
    text: "Runbook"
    variant: "success"
---

> 🔗 **Related**: [Cheat Sheet: Container Engines](./container-engines-cheatsheet.md) · [Architecture: Container Images (bum-in-a-box)](../architecture/bum-in-a-box-explanation.md)

This runbook guides engineers through verifying container supply-chain integrity, authenticating with GitHub Container Registry (GHCR), validating cryptographic Cosign signatures, generating and scanning Software Bills of Materials (SBOM), and enforcing immutable SHA-256 digest pinning.

---

## 📋 Prerequisites & Requirements

Before starting this procedure, ensure the following conditions are met:

- [ ] Container runtime installed: `docker` or `podman`
- [ ] Verification CLI installed: `cosign` (v2+)
- [ ] SBOM tools installed: `syft` and `trivy`
- [ ] GitHub Personal Access Token (PAT) with `read:packages` (or `write:packages` for publishing)

---

## 🚀 Step-by-Step Procedure

### Step 1: Authenticate with GitHub Container Registry

Log in to GHCR through your container engine using standard input:

```bash
# Provide personal access token via environment variable
echo "$GHCR_TOKEN" | docker login ghcr.io -u <github-username> --password-stdin
```

### Step 2: Understand Tagging & Pull Conventions

```bash
# Immutable exact patch release (deterministic production deployments)
docker pull ghcr.io/bumuellp/lint-tools:v1.0.1

# Floating major release tag (tracks latest v1.x bugfixes)
docker pull ghcr.io/bumuellp/lint-tools:v1

# Floating latest tag (tracks latest main branch commit)
docker pull ghcr.io/bumuellp/lint-tools:latest
```

### Step 3: Verify Container Signatures with Cosign

Verify cryptographic image signatures using either a designated public key or keyless GitHub Actions OIDC identity:

```bash
# Option A: Key-based verification using Cosign public key
cosign verify \
  --key cosign.pub \
  ghcr.io/bumuellp/lint-tools:v1.0.1

# Option B: Keyless verification using GitHub Actions OIDC identity
cosign verify \
  --certificate-identity-regexp "https://github.com/bumuellp/.*" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ghcr.io/bumuellp/lint-tools:v1.0.1
```

### Step 4: Inspect and Scan Software Bill of Materials (SBOM)

Verify image components and check for known vulnerabilities across package dependencies:

```bash
# 1. Download and inspect published SBOM from registry using Cosign
cosign download sbom ghcr.io/bumuellp/lint-tools:v1.0.1 > published-sbom.json

# 2. Verify CycloneDX SBOM attestation attached to the image
cosign verify-attestation \
  --type cyclonedx \
  --certificate-identity-regexp "https://github.com/bumuellp/.*" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ghcr.io/bumuellp/lint-tools:v1.0.1

# 3. Generate CycloneDX SBOM locally with Syft
syft packages ghcr.io/bumuellp/lint-tools:latest -o cyclonedx-json > local-sbom.json

# 4. Scan the SBOM file for known vulnerabilities using Trivy
trivy sbom local-sbom.json
```

### Step 5: Enforce Immutable Digest Pinning

Tags are mutable pointers that can be moved or overwritten. Pin critical production containers to cryptographic repository digests:

```bash
# Extract exact immutable repository digest (SHA-256)
docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/bumuellp/lint-tools:v1.0.1

# Run container pinned strictly by cryptographic hash
docker run --rm ghcr.io/bumuellp/lint-tools@sha256:4f3a8b24ef0987a1c4bc8...
```

---

## ✅ Verification & Health Checks

```bash
# 1. Confirm Cosign signature verification returns exit code 0
cosign verify --key cosign.pub ghcr.io/bumuellp/lint-tools:v1.0.1 > /dev/null && echo "Signature valid"

# 2. Confirm Trivy scan passes with zero HIGH or CRITICAL vulnerabilities
trivy sbom --severity HIGH,CRITICAL --exit-code 1 local-sbom.json
```

---

## 🔍 Troubleshooting & Incident Response

### Common Failure Modes

#### Issue: Cosign Returns `no matching signatures`

- **Cause**: Image was pushed without signing, or the certificate identity does not match the regex supplied in `--certificate-identity-regexp`.
- **Remedy**: Inspect the repository GitHub Actions workflow logs to verify that the Cosign signing step ran and used the matching repository OIDC issuer.

#### Issue: `trivy sbom` Reports Unpatched High/Critical CVEs

- **Cause**: Upstream base image layers or package dependencies contain newly published vulnerabilities.
- **Remedy**: Trigger a rebuild using `lights-camera-bum-action` with updated base images or update the toolchain version in `bum-in-a-box`.

---

## 🛡️ Security Hardening Checklist

> [!IMPORTANT]
>
> - Never deploy `:latest` tags directly to production environments. Pin to immutable patch tags or exact SHA-256 digests.
> - Verify SBOM attestations during CI before promoting container images to production clusters.
> - Ensure GHCR personal access tokens are stored in secret managers and granted only minimum required scopes (`read:packages`).

---

## 🔗 Related Documentation & Context

- **Cheat Sheet**: [Container Engines](./container-engines-cheatsheet.md): Podman and Docker execution syntax and storage cleanup.
- **Architecture**: [Container Images (bum-in-a-box)](../architecture/bum-in-a-box-explanation.md): Supply-chain hardening and vulnerability gate policies.
- **Cheat Sheet**: [Kubernetes CLI](./kubernetes-cheatsheet.md): Workload deployment and pod inspection commands.
