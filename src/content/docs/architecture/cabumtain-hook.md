---
title: Git Hooks (cabumtain-hook)
description: Modular pre-commit and pre-push hook collection for security, linting, and tag protection.
---

[**`cabumtain-hook`**](https://github.com/bumuellp/cabumtain-hook) is a modular Git hook collection that enforces quality gates on developer workstations prior to pushing code to GitHub.

---

## 🪝 Available Hooks

| Hook ID                      | Stage                | Description                                                                                      |
| :--------------------------- | :------------------- | :----------------------------------------------------------------------------------------------- |
| **`commit-msg`**             | `commit-msg`         | Enforces Conventional Commit format (`feat`, `fix`, `docs`, etc.) with subject <= 72 characters. |
| **`tag-immutability-guard`** | `pre-push`           | Prevents mutating, moving, or force-deleting existing SemVer release tags (`v*.*.*`) on remote.  |
| **`act-integration-test`**   | `pre-push`, `manual` | Executes local GitHub Actions workflow integration tests with native `act` before push.          |
| **`secret-scan`**            | `commit`             | Scans staged files and history for high-entropy secrets and tokens using TruffleHog.             |
| **`shell-lint`**             | `commit`             | Autoformats with `shfmt` and lints with `shellcheck`.                                            |
| **`yaml-xml-lint`**          | `commit`             | Lints YAML with `yamllint` (ignores `.enc.yml`) and parses XML.                                  |
| **`python-tests`**           | `commit`             | Automatically discovers and executes unit tests via `pytest` (using `uv` or `.venv`).            |
| **`trivy-security`**         | `commit`             | Scans manifests and Dockerfiles for security vulnerabilities and misconfigurations.              |
| **`ansible-lint`**           | `commit`             | Validates syntax and best practices for Ansible playbooks.                                       |
| **`k8s-validate`**           | `commit`             | Kubernetes manifest validation using Kustomize, Kubeconform, and Kube-score.                     |

---

## 🚀 Usage Example

```yaml
repos:
  - repo: https://github.com/bumuellp/cabumtain-hook
    rev: v1.3.0
    hooks:
      - id: commit-msg
      - id: secret-scan
      - id: shell-lint
      - id: yaml-xml-lint
      - id: python-tests
      - id: trivy-config
      - id: trivy-fs
      - id: tag-immutability-guard
      - id: act-integration-test
```
