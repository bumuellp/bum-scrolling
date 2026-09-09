---
title: GitHub CLI (gh) Cheat-Sheet
description: Comprehensive reference for GitHub CLI commands, workflows, releases, and extensions.
---

The GitHub CLI (`gh`) allows full terminal control over repositories, pull requests, releases, and GitHub Actions CI pipelines.

---

## 🔑 Authentication & Configuration

```bash
# Authenticate interactively with GitHub account
gh auth login

# Check authentication status and active token scopes
gh auth status

# Refresh authentication token with additional scopes (e.g. packages)
gh auth refresh -s write:packages,repo,workflow
```

---

## 📦 Repositories & Releases

### Repository Management

```bash
# Clone a repository
gh repo clone bumuellp/lights-camera-bum-action

# View repository overview and README directly in terminal
gh repo view bumuellp/lights-camera-bum-action

# List repositories belonging to user or organization
gh repo list bumuellp --limit 30
```

### GitHub Releases

```bash
# Create an official release from a Git tag with auto-generated release notes
gh release create v1.0.2 --title "v1.0.2" --generate-notes

# Upload build artifacts / binaries to an existing release
gh release upload v1.0.2 ./build/artifact.tar.gz

# Download all assets from a specific release
gh release download v1.0.2

# List existing releases in current repository
gh release list
```

---

## 🔀 Pull Requests

```bash
# Create a pull request interactively
gh pr create --title "feat: add container smoke tests" --body "Closes #12"

# Check out a pull request branch locally for review
gh pr checkout 42

# View diff of a pull request
gh pr diff 42

# Merge a pull request with rebase or squash
gh pr merge 42 --squash --delete-branch
```

---

## ⚙️ GitHub Actions & CI Management

```bash
# List recent workflow runs across the repository
gh run list

# Watch live output of a running CI workflow run
gh run watch <run_id>

# View failure log and step details for a failed run
gh run view <run_id> --log-failed

# Re-run a failed workflow run
gh run rerun <run_id> --failed
```

---

## 🔌 Extensions & GitHub API

```bash
# Install an extension (e.g. local GitHub Actions runner with act)
gh extension install nektos/gh-act

# List installed extensions
gh extension list

# Query GitHub REST API directly (supports jq filtering)
gh api repos/bumuellp/bum-in-a-box/packages/container/lint-tools/versions --jq '.[].name'
```
