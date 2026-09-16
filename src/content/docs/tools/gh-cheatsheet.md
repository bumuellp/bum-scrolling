---
title: GitHub CLI (gh) Cheat Sheet
description: High-density command reference for GitHub CLI authentication, repository cloning, pull request reviews, release publishing, and workflow inspection.
sidebar:
  label: "GitHub CLI (gh)"
  order: 30
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: Git CLI](./git-cheatsheet.md) · [Runbook: Semantic Versioning & Release Tagging](./git-release-runbook.md) · [Cheat Sheet: GitHub Actions CI/CD](./github-actions-cheatsheet.md)

The GitHub CLI (`gh`) brings pull requests, release asset management, GitHub Actions runs, and REST API queries directly to the terminal.

---

## ⚡ Quick Start & Core Commands

```bash
# Check authentication status and active token scopes
gh auth status

# Clone repository locally
gh repo clone bumuellp/lights-camera-bum-action

# Create pull request with interactive prompt
gh pr create --title "feat: add container smoke tests" --body "Closes #12"

# Check out a pull request branch locally for testing
gh pr checkout 42

# Watch real-time logs of a running GitHub Actions workflow
gh run watch <run_id>

# Create an official release with auto-generated release notes
gh release create v1.0.2 --title "v1.0.2" --generate-notes
```

---

## 📊 Command & Flag Matrix

| Command / Subcommand        | Syntax                                      | Purpose / When Useful                                            |
| :-------------------------- | :------------------------------------------ | :--------------------------------------------------------------- |
| **`auth login`**            | `gh auth login`                             | Interactively authenticates with GitHub using web or token flow. |
| **`auth refresh -s`**       | `gh auth refresh -s write:packages`         | Expands token permissions without re-authenticating.             |
| **`repo clone`**            | `gh repo clone org/repo`                    | Clones repository using configured SSH or HTTPS preferences.     |
| **`repo view`**             | `gh repo view bumuellp/repo`                | Renders repository description and README in terminal.           |
| **`pr checkout`**           | `gh pr checkout <pr_number>`                | Switches to a detached branch containing the PR changes.         |
| **`pr diff`**               | `gh pr diff <pr_number>`                    | Displays code diff of pull request directly in terminal.         |
| **`pr merge`**              | `gh pr merge 42 --squash --delete-branch`   | Merges PR using squash strategy and cleans up remote branch.     |
| **`release create`**        | `gh release create v1.0.0 --generate-notes` | Tags commit, generates changelog, and creates release.           |
| **`release upload`**        | `gh release upload v1.0.0 ./binary.tar.gz`  | Attaches compiled assets to an existing release tag.             |
| **`release download`**      | `gh release download v1.0.0`                | Downloads all release artifacts to current directory.            |
| **`run list`**              | `gh run list --limit 10`                    | Displays status and runtime of recent CI workflow runs.          |
| **`run view --log-failed`** | `gh run view <id> --log-failed`             | Prints only the failing step output to diagnose CI breaks.       |
| **`run rerun --failed`**    | `gh run rerun <id> --failed`                | Re-executes only the failed jobs in a workflow run.              |

---

## 🛠️ Common Patterns & Workflows

### Re-authenticating for Container Registries

When publishing images to GitHub Container Registry (GHCR), ensure your token includes the `write:packages` scope:

```bash
gh auth refresh -s write:packages,repo,workflow
```

### Inspecting CI Failures Rapidly

```bash
# List recent failed runs
gh run list --status failure

# View failure log directly without opening browser
gh run view <run_id> --log-failed

# Rerun failed jobs
gh run rerun <run_id> --failed
```

### Querying the GitHub REST API (`gh api`)

Use `gh api` with integrated `jq` filtering to query GitHub data without managing separate tokens:

```bash
# Query container image versions in GHCR
gh api repos/bumuellp/bum-in-a-box/packages/container/lint-tools/versions \
  --jq '.[].name'

# Check rate limit status
gh api rate_limit
```

### Extensions Management

```bash
# Install local GitHub Actions runner extension (act)
gh extension install nektos/gh-act

# List installed extensions
gh extension list
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: Git CLI](./git-cheatsheet.md)
- [Runbook: Semantic Versioning & Release Tagging](./git-release-runbook.md)
- [Cheat Sheet: GitHub Actions CI/CD](./github-actions-cheatsheet.md)
