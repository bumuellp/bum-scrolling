---
title: Tooling Ecosystem Architecture
description: Architectural overview of the public repository triad, shared workflows, and quality gates across the bum infrastructure ecosystem.
sidebar:
  label: "Ecosystem Overview"
  order: 10
  badge:
    text: "Architecture"
    variant: "tip"
---

> 🔗 **Related**: [Architecture: Container Images (bum-in-a-box)](./bum-in-a-box-explanation.md) · [Architecture: Actions Suite (lights-camera-bum-action)](./lights-camera-bum-action-explanation.md) · [Architecture: Git Hooks (cabumtain-hook)](./cabumtain-hook-explanation.md)

The open-source tooling ecosystem consists of three complementary building blocks designed to automate DevOps, Git quality gates, and container delivery:

```mermaid
graph LR
    CH["bumuellp/cabumtain-hook<br><i>Git Pre-Commit & Pre-Push Hooks</i>"]
    LCBA["bumuellp/lights-camera-bum-action<br><i>Reusable GitHub Actions & CI</i>"]
    BIAB["bumuellp/bum-in-a-box<br><i>Hardened OCI Container Images</i>"]

    CH -->|Local shift-left validation| LCBA & BIAB
    BIAB -->|Provides lint-tools container| LCBA
    LCBA -->|Automates CI/CD & packages| BIAB
```

---

## 🏗️ The Repository Ecosystem

| Repository                              | Responsibility                                                                                                                          | Canonical Resource                                                                      |
| :-------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **`bumuellp/cabumtain-hook`**           | Modular Git hooks: Conventional Commits, Tag Immutability, `tofu-fmt`, secret scanning.                                                 | [cabumtain-hook GitHub](https://github.com/bumuellp/cabumtain-hook)                     |
| **`bumuellp/lights-camera-bum-action`** | 12 reusable GitHub Actions: containerized `pre-commit`, `sync-dns-record`, `decrypt-sops`, `setup-tofu-backend`, SemVer `bump-version`. | [lights-camera-bum-action GitHub](https://github.com/bumuellp/lights-camera-bum-action) |
| **`bumuellp/bum-in-a-box`**             | Curated container images: `lint-tools` (with OpenTofu 1.13.1), `llama-proxy`, `mcpo`, `openclaw`, `vibe-trading`.                       | [bum-in-a-box GitHub](https://github.com/bumuellp/bum-in-a-box)                         |
| **`bumuellp/tofu-bum`**                 | Generic, reusable OpenTofu infrastructure modules for Hetzner Cloud (ephemeral compute, volumes, firewalls).                            | [tofu-bum GitHub](https://github.com/bumuellp/tofu-bum)                                 |
| **`bumuellp/mine-your-own-bum`**        | Public template repository for on-demand Minecraft crossplay servers with automatic idle shutdown and dynamic DNS.                      | [mine-your-own-bum GitHub](https://github.com/bumuellp/mine-your-own-bum)               |

---

## 🛡️ Testing Pyramid Standard

Across all three repositories, quality is enforced at three distinct levels:

1. **Level 1: Static Analysis & Formatters**:
   - Runs locally on `git commit` and in CI.
   - Enforces `yamllint`, `shellcheck`, and `check-jsonschema` (validating action and workflow YAML manifests against official schemas).

2. **Level 2: Unit & Behavioral Testing**:
   - Fast `pytest` suites run via `python-tests.sh` hook.
   - Tests command argument generation, error handling, exit code propagation, and failure modes with mocked dependencies.

3. **Level 3: Integration & Smoke Testing**:
   - **Actions**: Tested via GitHub Actions composite self-tests (`.github/workflows/integration-tests.yml`), runnable both in CI and locally via `act`.
   - **Containers**: Smoke tested via `scripts/smoke-test.sh` verifying non-root execution (`UID != 0`) and binary functionality before publishing to GHCR.

---

## 🔗 Related Documentation & Context

- [Architecture: Container Images (bum-in-a-box)](./bum-in-a-box-explanation.md)
- [Architecture: Actions Suite (lights-camera-bum-action)](./lights-camera-bum-action-explanation.md)
- [Architecture: Git Hooks (cabumtain-hook)](./cabumtain-hook-explanation.md)
- [Cheat Sheet: Pre-Commit Framework](../tools/pre-commit-cheatsheet.md)
