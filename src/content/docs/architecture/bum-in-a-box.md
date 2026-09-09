---
title: Container Catalog (bum-in-a-box)
description: Production-hardened container images with zero known HIGH/CRITICAL CVEs and unprivileged execution.
---

[**`bum-in-a-box`**](https://github.com/bumuellp/bum-in-a-box) provides specialized, security-scanned OCI container images published to GitHub Packages (GHCR).

## Published Packages

| Image              | Base OS / Runtime                |        Security Target         |  Default User  | Documentation                                                                               |
| :----------------- | :------------------------------- | :----------------------------: | :------------: | :------------------------------------------------------------------------------------------ |
| **`lint-tools`**   | Debian Trixie + Go 1.27 + Python | **0 Known HIGH/CRITICAL CVEs** | `appuser:1000` | [lint-tools Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/lint-tools)     |
| **`llama-proxy`**  | Vulkan GGML + llama-swap         | **0 Known HIGH/CRITICAL CVEs** |  `1000:1000`   | [llama-proxy Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/llama-proxy)   |
| **`mcpo`**         | Node 24 Slim + Python + uv       | **0 Known HIGH/CRITICAL CVEs** |     `node`     | [mcpo Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/mcpo)                 |
| **`openclaw`**     | Node + Playwright Chromium       | **0 Known HIGH/CRITICAL CVEs** |  `1000:1000`   | [openclaw Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/openclaw)         |
| **`vibe-trading`** | Python 3.11 + Vite/Vue           | **0 Known HIGH/CRITICAL CVEs** |     `vibe`     | [vibe-trading Docs](https://github.com/bumuellp/bum-in-a-box/tree/main/images/vibe-trading) |

---

## 🔒 Security Principles & Trivy Policy

1. **Trivy Vulnerability Gate (HIGH + CRITICAL)**:
   - Evaluated via `trivy.yaml` targeting severity levels: `HIGH`, `CRITICAL`.
   - Active scanners: `vuln`, `misconfig`, `secret`.
   - CI builds strictly enforce `exit-code: 1` on any detected unpatched vulnerability before pushing to GHCR.
2. **Supply-Chain Hardening**: All upstream Go utilities are compiled from source with official Go 1.27.1, eliminating inherited CVEs in third-party binaries.
3. **Zero-Root Policy**: Every runtime stage explicitly switches to a non-root UID/GID before entrypoint execution.
4. **Smoke Testing**: Before pushing images, `./scripts/smoke-test.sh` executes the local container, verifying binaries and user ID permissions.
