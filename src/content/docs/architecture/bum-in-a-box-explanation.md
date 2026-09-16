---
title: Container Catalog Architecture (bum-in-a-box)
description: Hardened OCI container images with automated Trivy vulnerability scanning, compile-from-source supply chains, and unprivileged execution.
sidebar:
  label: "Container Images (bum-in-a-box)"
  order: 20
  badge:
    text: "Architecture"
    variant: "tip"
---

> 🔗 **Related**: [Architecture: Tooling Ecosystem](./ecosystem-explanation.md) · [Runbook: Container Image Security](../containers/image-security-runbook.md) · [Cheat Sheet: Container Engines](../containers/container-engines-cheatsheet.md)

[bum-in-a-box](https://github.com/bumuellp/bum-in-a-box) provides specialized, security-scanned OCI container images published to GitHub Packages (GHCR).

---

## 📦 Published Packages

| Image              | Base OS / Runtime                | Vulnerability Scanning |  Default User  | Documentation                                                                               |
| :----------------- | :------------------------------- | :--------------------: | :------------: | :------------------------------------------------------------------------------------------ |
| **`lint-tools`**   | Debian Trixie + Go 1.27 + Python | Trivy (HIGH, CRITICAL) | `appuser:1000` | [lint-tools Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/lint-tools)     |
| **`llama-proxy`**  | Vulkan GGML + llama-swap         | Trivy (HIGH, CRITICAL) |  `1000:1000`   | [llama-proxy Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/llama-proxy)   |
| **`mcpo`**         | Node 24 Slim + Python + uv       | Trivy (HIGH, CRITICAL) |     `node`     | [mcpo Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/mcpo)                 |
| **`openclaw`**     | Node + Playwright Chromium       | Trivy (HIGH, CRITICAL) |  `1000:1000`   | [openclaw Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/openclaw)         |
| **`vibe-trading`** | Python 3.11 + Vite/Vue           | Trivy (HIGH, CRITICAL) |     `vibe`     | [vibe-trading Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/vibe-trading) |

---

## 🔒 Security Principles & Vulnerability Gates

1. **Trivy Vulnerability Gate (HIGH + CRITICAL)**:
   - Configured via `trivy.yaml` targeting severity levels `HIGH` and `CRITICAL`.
   - Scanners evaluated: `vuln`, `misconfig`, `secret`.
   - CI builds enforce `exit-code: 1` on detected unpatched vulnerabilities before publishing images to GHCR.
2. **Supply-Chain Hardening**: Upstream Go utilities are compiled from source using pinned Go toolchains, eliminating untracked third-party binaries.
3. **Unprivileged Execution**: Every runtime stage explicitly switches to a non-root UID/GID before entrypoint execution.
4. **Smoke Testing**: Before pushing images, `./scripts/smoke-test.sh` executes the local container, verifying binaries and user ID permissions.

---

## 🔗 Related Documentation & Context

- [Architecture: Tooling Ecosystem](./ecosystem-explanation.md)
- [Runbook: Container Image Security](../containers/image-security-runbook.md)
- [Cheat Sheet: Container Engines](../containers/container-engines-cheatsheet.md)
- [Architecture: Actions Suite (lights-camera-bum-action)](./lights-camera-bum-action-explanation.md)
