---
title: GitHub Actions CI/CD Cheat Sheet
description: High-density syntax and pattern reference for GitHub Actions workflow triggers, concurrency, permissions, matrix strategies, reusable workflows, and composite actions.
sidebar:
  label: "GitHub Actions CI/CD"
  order: 40
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: GitHub CLI (gh)](./gh-cheatsheet.md) · [Runbook: Semantic Versioning & Release Tagging](./git-release-runbook.md) · [Architecture: Actions Suite (lights-camera-bum-action)](../architecture/lights-camera-bum-action-explanation.md)

GitHub Actions automates continuous integration, container image publishing, and releases. This reference provides hardened workflow patterns, concurrency controls, least-privilege permissions, and composite action definitions.

---

## ⚡ Quick Start & Core Patterns

```yaml
# Hardened root defaults
name: CI
on:
  push:
    branches: [main]
    paths:
      - "src/**"
      - "pyproject.toml"
  pull_request:
    branches: [main]
  workflow_dispatch:

# Cancel outdated queued runs on push
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

# Default to read-only token
permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: Run Test Suite
        run: make test
```

---

## 🏷️ Version Pinning Strategy

| Target Action Type                  | Pinning Method          | Syntax Example                              | Rationale                                                                                      |
| :---------------------------------- | :---------------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------- |
| **Internal / Organization Actions** | Floating Major Tag      | `uses: bumuellp/shared@v1`                  | Automatically inherits non-breaking security patches without manual bumps across repositories. |
| **Third-Party Marketplace Actions** | 40-character Commit SHA | `uses: actions/checkout@11bd71... # v4.2.2` | Defense against upstream account compromise and malicious tag rewrites.                        |
| **Audit-Sensitive Releases**        | Exact SemVer Tag        | `uses: organization/shared@v1.3.0`          | Guarantees exact reproducible builds across environments.                                      |

---

## 📊 Essential Workflow Syntax & Patterns

### 1. Granular Triggers & Path Filtering

Prevent running resource-heavy builds when modifying documentation or non-code files:

```yaml
on:
  push:
    branches: [main]
    paths:
      - "src/**"
      - "Dockerfile"
    paths-ignore:
      - "docs/**"
      - "**.md"
  pull_request:
    branches: [main]
```

---

### 2. Concurrency Control

Avoid wasted runner minutes by auto-canceling previous runs when new commits are pushed to a pull request:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

---

### 3. Least Privilege Permissions

Define restrictive root-level permissions and elevate access only within specific jobs:

```yaml
permissions:
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write # For creating release tags
      packages: write # For pushing images to GHCR
      id-token: write # For OIDC cloud authentication
    steps:
      - uses: actions/checkout@v7
```

---

### 4. Matrix Builds & Fail-Fast

Run tests across multiple runtime versions concurrently:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false # Keep running remaining combinations if one fails
      matrix:
        os: [ubuntu-latest]
        python-version: ["3.11", "3.12"]
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
```

---

### 5. Reusable Workflows (`workflow_call`)

Centrally maintain deployment or build logic shared across multiple repositories:

```yaml
# In reusable-workflow-repo/.github/workflows/deploy.yml
name: Reusable Deploy
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      DEPLOY_KEY:
        required: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: echo "Deploying to ${{ inputs.environment }}"
```

Caller configuration:

```yaml
jobs:
  call-deploy:
    uses: bumuellp/shared-workflows/.github/workflows/deploy.yml@v1
    with:
      environment: "production"
    secrets: inherit
```

---

### 6. Composite Actions (`using: composite`)

Package multi-step shell commands, linters, or setup scripts into a single reusable action step:

```yaml
# In action.yml
name: "Setup Environment & Dependencies"
description: "Configures Python runtime and dependencies"
inputs:
  python-version:
    required: false
    default: "3.12"
runs:
  using: "composite"
  steps:
    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: ${{ inputs.python-version }}
      shell: bash
    - name: Install dependencies
      run: pip install -r requirements.txt
      shell: bash
```

---

### 7. Step Conditionals & Failure Handlers

Inspect step outcomes and ensure cleanup steps execute even if test steps fail:

```yaml
steps:
  - name: Run Test Suite
    id: run_tests
    run: pytest tests/
    continue-on-error: true

  - name: Capture Logs on Failure
    if: steps.run_tests.outcome == 'failure'
    run: docker compose logs > debug.log

  - name: Teardown Test Infrastructure
    if: always()
    run: docker compose down -v

  - name: Propagate Exit Code
    if: steps.run_tests.outcome == 'failure'
    run: exit 1
```

---

### 8. Custom Step Summaries (`$GITHUB_STEP_SUMMARY`)

Append GitHub Flavored Markdown directly to `$GITHUB_STEP_SUMMARY` to display formatted summaries, tables, or diagnostic reports directly on the workflow run overview page in the GitHub UI:

```yaml
- name: Publish Test Summary
  if: always()
  run: |
    echo "### Build & Test Summary 🚀" >> $GITHUB_STEP_SUMMARY
    echo "" >> $GITHUB_STEP_SUMMARY
    echo "| Component | Status | Details |" >> $GITHUB_STEP_SUMMARY
    echo "| :--- | :---: | :--- |" >> $GITHUB_STEP_SUMMARY
    echo "| Unit Tests | ✅ Pass | 42 tests passing |" >> $GITHUB_STEP_SUMMARY
    echo "| Smoke Tests | ✅ Pass | Non-root containers validated |" >> $GITHUB_STEP_SUMMARY
    echo "" >> $GITHUB_STEP_SUMMARY
    echo "> Git Commit SHA: \`${{ github.sha }}\`" >> $GITHUB_STEP_SUMMARY
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: GitHub CLI (gh)](./gh-cheatsheet.md)
- [Runbook: Semantic Versioning & Release Tagging](./git-release-runbook.md)
- [Architecture: Actions Suite (lights-camera-bum-action)](../architecture/lights-camera-bum-action-explanation.md)
- [Cheat Sheet: Pre-Commit Framework](./pre-commit-cheatsheet.md)
