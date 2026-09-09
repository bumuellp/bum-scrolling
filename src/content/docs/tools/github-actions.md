---
title: GitHub Actions CI/CD Cheat-Sheet
description: Core workflow patterns, composite actions, concurrency control, and tag pinning best practices.
---

GitHub Actions automates testing, container image building, release management, and deployments.

---

## 🏷️ Version Pinning: Floating Major Tags (`@v1`) vs Immutable SHA

When referencing actions in `uses:`, choosing between floating tags and immutable SHAs is a balance between maintenance velocity and supply-chain isolation:

```yaml
# 1. Floating Major Tag (Recommended for internal & trusted organizational actions)
uses: organization/shared-action@v1

# 2. Immutable SemVer Release Tag (Predictable opt-in releases)
uses: organization/shared-action@v1.3.0

# 3. Full Commit SHA (Recommended for third-party marketplace actions)
uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

### Why Use Floating Major Tags (`@v1`) for Internal Actions?
- **Automatic Patch Propagation**: Non-breaking bug fixes, security patches, and runner compatibility updates automatically apply to all caller repositories without opening pull requests across dozens of repositories.
- **Contract Adherence**: Semantic Versioning guarantees that `@v1` never introduces breaking input/output changes (which belong in `@v2`).
- **Low Maintenance Overhead**: Eliminates version churn across internal repositories while preserving stability.

> [!TIP]
> **The Dual Strategy**:
> - **Internal / Trusted Workflows**: Use floating major tags (`@v1`).
> - **External Third-Party Marketplace Actions**: Pin to full 40-character commit SHAs with Dependabot/Renovate to defend against supply-chain account takeovers.

---

## 🎛️ Essential Workflow Patterns & Syntax

### 1. Granular Triggers & Path Filtering
Avoid running expensive CI pipelines when only documentation or unrelated paths change:

```yaml
name: CI
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'pyproject.toml'
      - '.github/workflows/ci.yml'
    paths-ignore:
      - 'docs/**'
      - '**.md'
  pull_request:
    branches: [main]
  workflow_dispatch: # Enables manual trigger from GitHub UI
```

---

### 2. Concurrency Control (Canceling Outdated Builds)
Cancel redundant runs on rapid successive commits to save runner minutes:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }} # Cancel on PRs, allow main to finish
```

---

### 3. Least Privilege Permissions
Always define an explicit root-level `permissions` block:

```yaml
permissions:
  contents: read # Read-only access by default

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write # Elevated only where needed
      id-token: write # For OIDC authentication
      packages: write # For publishing to GHCR
    steps:
      - uses: actions/checkout@v7
```

---

### 4. Matrix Builds & Fail-Fast
Run tests across multiple operating systems and runtimes in parallel:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false # Keep other matrix jobs running if one fails
      matrix:
        os: [ubuntu-latest]
        python-version: ['3.11', '3.12']
        include:
          - python-version: '3.12'
            experimental: true
    steps:
      - uses: actions/checkout@v7
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
```

---

### 5. Reusable Workflows (`workflow_call`)
Centrally define deployment or build logic that multiple repositories call:

```yaml
# In reusable-workflow-repo/.github/workflows/deploy.yml
name: Reusable Deploy
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      node-version:
        required: false
        default: '24'
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

**Calling the Reusable Workflow:**
```yaml
jobs:
  call-deploy:
    uses: organization/shared-repo/.github/workflows/deploy.yml@v1
    with:
      environment: 'production'
    secrets: inherit # Automatically pass caller secrets
```

---

### 6. Composite Actions (`using: "composite"`)
Bundle repetitive shell commands, tool installations, or scripts into a single reusable action step:

```yaml
# In action.yml
name: "Setup Environment & Cache"
description: "Prepares workspace with tooling and dependencies"
inputs:
  python-version:
    description: "Python version"
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

    - name: Run internal script
      run: python3 "${{ github.action_path }}/setup.py"
      shell: bash
```

---

### 7. Step Conditionals & Failure Handlers
Inspect step outcomes and ensure cleanup steps execute even after failures:

```yaml
steps:
  - name: Run Test Suite
    id: run_tests
    run: pytest tests/
    continue-on-error: true # Do not immediately abort job

  - name: Capture Diagnostic Logs
    if: steps.run_tests.outcome == 'failure'
    run: docker compose logs > debug.log

  - name: Teardown Containers
    if: always() # Always run even if canceled or failed
    run: docker compose down -v

  - name: Propagate Final Status
    if: steps.run_tests.outcome == 'failure'
    run: exit 1
```
