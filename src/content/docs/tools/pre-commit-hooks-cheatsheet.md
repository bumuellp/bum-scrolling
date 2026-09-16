---
title: Curated Pre-Commit Hooks Cheat Sheet
description: Catalog of production-grade pre-commit hooks for file hygiene, CI schema validation, Python linting, documentation, security auditing, and Git governance.
sidebar:
  label: "Curated Hook Catalog"
  order: 55
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: Pre-Commit Framework](./pre-commit-cheatsheet.md) · [Cheat Sheet: Git CLI](./git-cheatsheet.md) · [Architecture: Git Hooks (cabumtain-hook)](../architecture/cabumtain-hook-explanation.md)

This catalog details recommended, battle-tested hooks categorized by capability, complete with repository sources, purpose descriptions, and operational contexts.

---

## 🧹 1. File Hygiene & Formatting

**Repository**: [`https://github.com/pre-commit/pre-commit-hooks`](https://github.com/pre-commit/pre-commit-hooks)

| Hook ID                   | Tool / Purpose                                             | When Useful                                                                        |
| :------------------------ | :--------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **`trailing-whitespace`** | Strips invisible trailing whitespace from modified lines.  | Eliminates unnecessary diff noise across all text files.                           |
| **`end-of-file-fixer`**   | Ensures files terminate with a single trailing newline.    | Prevents POSIX file parsing errors and Git `\ No newline at end of file` warnings. |
| **`check-yaml`**          | Validates YAML syntax across all `.yaml` and `.yml` files. | Catches indentation errors, malformed lists, and invalid keys before committing.   |
| **`mixed-line-ending`**   | Normalizes all line breaks to Unix LF (`--fix=lf`).        | Mandatory on cross-platform teams to prevent CRLF line endings.                    |

---

## ⚙️ 2. Workflow & Action Schema Validation

**Repository**: [`https://github.com/python-jsonschema/check-jsonschema`](https://github.com/python-jsonschema/check-jsonschema)

| Hook ID                      | Tool / Purpose                                                               | When Useful                                                                               |
| :--------------------------- | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **`check-github-workflows`** | Validates `.github/workflows/*.yml` against official GitHub OpenAPI schemas. | Catches syntax errors, invalid event triggers, and missing inputs locally before pushing. |
| **`check-github-actions`**   | Validates `action.yml` composite action metadata schemas.                    | Ensures action inputs, outputs, and `runs.using` syntax comply with specifications.       |

---

## 🐍 3. Python Linting & Formatting

**Repository**: [`https://github.com/astral-sh/ruff-pre-commit`](https://github.com/astral-sh/ruff-pre-commit)

| Hook ID           | Tool / Purpose                                                                                | When Useful                                                                       |
| :---------------- | :-------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **`ruff`**        | Ultra-fast Python linter (`select = ["E", "F", "W", "I", "UP", "B"]`) with automatic `--fix`. | Replaces Flake8, isort, and pyupgrade in sub-millisecond execution times.         |
| **`ruff-format`** | Deterministic Python code formatter.                                                          | Guarantees clean, standardized Python formatting (replaces Black) across scripts. |

---

## 📖 4. Documentation & Web Assets

**Repositories**:

- Prettier: [`https://github.com/pre-commit/mirrors-prettier`](https://github.com/pre-commit/mirrors-prettier)
- Markdownlint: [`https://github.com/DavidAnson/markdownlint-cli2`](https://github.com/DavidAnson/markdownlint-cli2)

| Hook ID                 | Tool / Purpose                                              | When Useful                                                                           |
| :---------------------- | :---------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| **`prettier`**          | Formatter for Markdown, YAML, and JSON.                     | Ensures documentation, frontmatter, and configuration maintain consistent formatting. |
| **`markdownlint-cli2`** | Fast linter for Markdown syntax and structural correctness. | Catches unquoted YAML colons, invalid heading levels, and malformed tables.           |

---

## 🛡️ 5. Security, Testing & Git Governance (`cabumtain-hook`)

**Repository**: [`https://github.com/bumuellp/cabumtain-hook`](https://github.com/bumuellp/cabumtain-hook)

### Shell & Infrastructure

| Hook ID             | Tool / Purpose                                                              | When Useful                                                                               |
| :------------------ | :-------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **`shell-lint`**    | Formats scripts with `shfmt` and lints with `shellcheck`.                   | Catches unquoted variables, subshell bugs, and non-POSIX constructs in Bash/sh scripts.   |
| **`yaml-xml-lint`** | Lints YAML with `yamllint` and validates XML schemas.                       | Enforces strict document structure while automatically skipping SOPS-encrypted secrets.   |
| **`k8s-validate`**  | Validates Kubernetes manifests with Kustomize, Kubeconform, and Kube-score. | Validates Kubernetes YAML for OpenAPI compliance, security contexts, and resource limits. |

### Automated Testing

| Hook ID            | Tool / Purpose                                                                         | When Useful                                                                                       |
| :----------------- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **`python-tests`** | Discovers and executes `pytest` or `unittest` suites when a `tests/` directory exists. | Shift-left testing ensuring unit tests pass before a commit is created (`pass_filenames: false`). |

### Security & Secret Scanning

| Hook ID            | Tool / Purpose                                                                            | When Useful                                                                                  |
| :----------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **`secret-scan`**  | Deep credential and token scanning using TruffleHog.                                      | Blocks commits containing accidental leaks of private keys, tokens, PATs, and passwords.     |
| **`trivy-config`** | Scans Dockerfiles, Kubernetes manifests, and IaC definitions for misconfigurations.       | Prevents running containers as root, missing security contexts, and insecure port exposures. |
| **`trivy-fs`**     | Scans source code and lockfiles for known CVEs and licenses (`--severity HIGH,CRITICAL`). | Blocks introduction of packages with known vulnerabilities or non-compliant licenses.        |

### Git Governance & Release Protection

| Hook ID                      | Tool / Purpose                                                                         | When Useful                                                                                            |
| :--------------------------- | :------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **`commit-msg`**             | Validates Conventional Commits syntax with a 72-character header limit.                | Enforces standardized commit history required for automated Semantic Version release calculations.     |
| **`tag-immutability-guard`** | Pre-push hook preventing force-pushes or rewrites to existing release tags (`v*.*.*`). | Protects downstream consumers from supply-chain drift and breaking changes on immutable release tags.  |
| **`act-integration-test`**   | Executes local GitHub Actions workflows using `act` and Docker prior to pushing.       | Verifies composite action integrations and workflow logic locally without waiting for cloud CI queues. |

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: Pre-Commit Framework](./pre-commit-cheatsheet.md)
- [Cheat Sheet: Git CLI](./git-cheatsheet.md)
- [Architecture: Git Hooks (cabumtain-hook)](../architecture/cabumtain-hook-explanation.md)
- [Runbook: Semantic Versioning & Release Tagging](./git-release-runbook.md)
