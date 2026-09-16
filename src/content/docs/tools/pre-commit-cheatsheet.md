---
title: Pre-Commit Framework Cheat Sheet
description: High-density reference for .pre-commit-config.yaml schema, hook parameters, immutable version pinning, cache mechanics, and CLI operations.
sidebar:
  label: "Pre-Commit Framework"
  order: 50
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: Curated Pre-Commit Hooks](./pre-commit-hooks-cheatsheet.md) · [Cheat Sheet: Git CLI](./git-cheatsheet.md) · [Architecture: Git Hooks (cabumtain-hook)](../architecture/cabumtain-hook-explanation.md)

[pre-commit](https://pre-commit.com/) manages git pre-commit, commit-msg, and pre-push hooks across multiple language environments, verifying code hygiene and security locally before remote pushes.

---

## ⚡ Quick Start & Core Commands

```bash
# 1. Install hooks across git commit, commit-msg, and pre-push stages
pre-commit install --hook-type pre-commit --hook-type commit-msg --hook-type pre-push

# 2. Run all configured hooks across all tracked files
pre-commit run --all-files

# 3. Run a specific hook on staged files only
pre-commit run ruff

# 4. Automatically bump all repos in .pre-commit-config.yaml to latest release tags
pre-commit autoupdate

# 5. Clean cached virtual environments to reclaim disk space
pre-commit clean
pre-commit gc
```

---

## ⚙️ Configuration Schema (`.pre-commit-config.yaml`)

### Root-Level Properties

```yaml
minimum_pre_commit_version: "3.2.0"
fail_fast: false
default_stages:
  - pre-commit
default_install_hook_types:
  - pre-commit
  - commit-msg
  - pre-push
exclude: "^(\\.venv|vendor|node_modules)/|.*\\.min\\.(js|css)$"
repos: []
```

| Key                              | Type    | Default        | Description                                                              |
| :------------------------------- | :------ | :------------- | :----------------------------------------------------------------------- |
| **`minimum_pre_commit_version`** | String  | `"0"`          | Enforces team-wide pre-commit CLI version parity.                        |
| **`fail_fast`**                  | Boolean | `false`        | Halts execution immediately on first failing hook.                       |
| **`default_stages`**             | List    | `[pre-commit]` | Default Git stages where hooks run unless overridden.                    |
| **`default_install_hook_types`** | List    | `[pre-commit]` | Stages activated by `pre-commit install` without explicit `--hook-type`. |
| **`exclude`**                    | Regex   | None           | Global path exclusion pattern applied across all hooks.                  |
| **`repos`**                      | List    | `[]`           | Remote git repositories or local hook definitions.                       |

---

## 🔧 Hook Arguments & Control Options

```yaml
- repo: https://github.com/astral-sh/ruff-pre-commit
  rev: v0.9.9
  hooks:
    - id: ruff
      # Pass CLI arguments directly to the underlying utility
      args: [--fix, --select, "E,F,W,I,UP,B"]
      # Target specific directory regex
      files: ^src/
      # Exclude specific files
      exclude: ^src/vendor/
      # Match files by pre-commit identify tags
      types_or: [python, pyi]
      # Install extra packages, plugins, or type definitions into the hook's isolated virtual environment
      additional_dependencies: [pydantic>=2.0]
      # Bind to git stage
      stages: [pre-commit]
      # Run against whole repo without passing individual file paths
      pass_filenames: true
      # Run even if no staged files match
      always_run: false
```

### Extending Hooks with `additional_dependencies`

Pre-commit provisions isolated virtual environments under `~/.cache/pre-commit/` per repository. Tools that rely on external plugins, parsers, or type stubs will fail unless declared under `additional_dependencies`:

#### 1. Prettier with Astro and Tailwind Plugins (Node.js)

```yaml
- repo: https://github.com/pre-commit/mirrors-prettier
  rev: v4.0.0-alpha.8
  hooks:
    - id: prettier
      types_or: [markdown, yaml, json, astro]
      additional_dependencies:
        - prettier@3.3.3
        - prettier-plugin-astro@0.14.1
        - prettier-plugin-tailwindcss@0.6.8
```

#### 2. Static Typing with Mypy Stubs (Python)

```yaml
- repo: https://github.com/pre-commit/mirrors-mypy
  rev: v1.11.0
  hooks:
    - id: mypy
      additional_dependencies:
        - pydantic>=2.8.0
        - types-requests
        - types-PyYAML
```

#### 3. ESLint with Framework Extensions (JavaScript / TypeScript)

```yaml
- repo: https://github.com/pre-commit/mirrors-eslint
  rev: v8.56.0
  hooks:
    - id: eslint
      additional_dependencies:
        - eslint@8.56.0
        - eslint-plugin-vue@9.20.0
        - typescript-eslint@8.0.0
```

---

## 🏷️ Version Pinning: Why Immutable Release Tags (`rev`) Are Mandatory

Pre-commit builds virtual environments under `~/.cache/pre-commit/` keyed strictly by `(repo_url, rev)`:

```yaml
# ❌ INCORRECT: Mutable references cause cache divergence
- repo: https://github.com/organization/shared-hooks
  rev: v1 # or rev: main

# ✅ CORRECT: Strict immutable SemVer tag
- repo: https://github.com/organization/shared-hooks
  rev: v1.3.0
```

1. **Cache Desync**: If a floating tag (`v1`) moves on the remote, existing developer machines will **never re-download the new changes** because their local cache for `v1` already exists. Clean CI runners will pull the updated ref, causing "works on my machine" failures.
2. **Deterministic Upgrades**: `pre-commit autoupdate` requires SemVer tags to cleanly query and increment releases.
3. **Execution Speed**: Avoids network round-trips to resolve branch heads on every local commit.

---

## 📝 Complete Production Configuration Example

```yaml
minimum_pre_commit_version: "3.2.0"
fail_fast: false
default_install_hook_types:
  - pre-commit
  - commit-msg
  - pre-push

repos:
  # File hygiene
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
        args: [--allow-multiple-documents]
      - id: mixed-line-ending
        args: [--fix=lf]

  # Workflow schemas
  - repo: https://github.com/python-jsonschema/check-jsonschema
    rev: 0.31.2
    hooks:
      - id: check-github-workflows
      - id: check-github-actions

  # Python tooling
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.9.9
    hooks:
      - id: ruff
        args: [--fix, --select, "E,F,I,UP,B"]
      - id: ruff-format

  # Formatting & linting
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v4.0.0-alpha.8
    hooks:
      - id: prettier
        types_or: [markdown, yaml, json]
        additional_dependencies:
          - prettier@3.3.3
          - prettier-plugin-astro@0.14.1

  - repo: https://github.com/DavidAnson/markdownlint-cli2
    rev: v0.17.2
    hooks:
      - id: markdownlint-cli2

  # Security & Git governance
  - repo: https://github.com/bumuellp/cabumtain-hook
    rev: v1.3.0
    hooks:
      - id: commit-msg
        stages: [commit-msg]
      - id: secret-scan
      - id: shell-lint
        args: [-i, 2, -ci]
      - id: python-tests
        pass_filenames: false
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: Curated Pre-Commit Hooks](./pre-commit-hooks-cheatsheet.md)
- [Cheat Sheet: Git CLI](./git-cheatsheet.md)
- [Architecture: Git Hooks (cabumtain-hook)](../architecture/cabumtain-hook-explanation.md)
- [Cheat Sheet: GitHub Actions CI/CD](./github-actions-cheatsheet.md)
