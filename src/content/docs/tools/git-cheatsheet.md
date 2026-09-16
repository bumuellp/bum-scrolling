---
title: Git CLI Cheat Sheet
description: High-density command reference for everyday Git branching, stashing, diffs, resets, interactive rebasing, worktrees, and bisect.
sidebar:
  label: "Git CLI"
  order: 10
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Runbook: Semantic Versioning & Release Tagging](./git-release-runbook.md) · [Cheat Sheet: GitHub CLI (gh)](./gh-cheatsheet.md) · [Cheat Sheet: Pre-Commit Framework](./pre-commit-cheatsheet.md)

This reference covers everyday Git workflows across branch switching, stash management, visual log graphs, history rewriting, multi-worktree execution, and binary search debugging with `bisect`.

---

## ⚡ Quick Start & Core Commands

```bash
# Create and switch to a new feature branch
git switch -c feat/telemetry-pipeline

# Switch back to main branch
git switch main

# View visual commit graph across all branches
git log --graph --oneline --decorate --all

# Stash working changes with descriptive label
git stash push -m "wip: parser refactoring"

# Discard all unstaged changes in working tree
git restore .

# Interactive rebase on main (squash, reword, fixup)
git rebase -i main
```

---

## 📊 Command & Subcommand Matrix

| Command / Subcommand     | Syntax                                | Purpose / When Useful                                                          |
| :----------------------- | :------------------------------------ | :----------------------------------------------------------------------------- |
| **`switch -c`**          | `git switch -c feat/name`             | Modern replacement for `git checkout -b` to create and enter a branch.         |
| **`branch -vv`**         | `git branch -vv`                      | Lists local branches with tracking status against remotes.                     |
| **`branch -d` / `-D`**   | `git branch -d feat/old`              | Deletes local branch (`-d` prevents deleting unmerged work; `-D` forces).      |
| **`push --delete`**      | `git push origin --delete branch`     | Removes remote branch on origin.                                               |
| **`stash push -m`**      | `git stash push -m "label"`           | Stashes dirty index and working directory under a readable label.              |
| **`stash pop`**          | `git stash pop`                       | Applies top stash and removes it from stash stack.                             |
| **`diff --staged`**      | `git diff --staged`                   | Shows line-by-line differences staged for the next commit.                     |
| **`diff --name-status`** | `git diff --name-status main..branch` | Summarizes added (`A`), modified (`M`), or deleted (`D`) files between refs.   |
| **`reset --soft`**       | `git reset --soft HEAD~1`             | Undoes the last commit while keeping all changes staged in the index.          |
| **`reset` (mixed)**      | `git reset HEAD~1`                    | Undoes the last commit and unstages changes, keeping files in working tree.    |
| **`restore .`**          | `git restore .`                       | Discards uncommitted modifications in tracked files across working directory.  |
| **`clean -fd`**          | `git clean -fd`                       | Deletes untracked files and directories (`-n` first for dry-run).              |
| **`cherry-pick`**        | `git cherry-pick <sha>`               | Applies changes from an isolated commit onto current branch.                   |
| **`worktree add`**       | `git worktree add ../path branch`     | Checks out a separate branch in an independent filesystem path simultaneously. |
| **`bisect`**             | `git bisect start; git bisect bad`    | Automated binary search to identify the commit that introduced a bug.          |

---

## 🛠️ Common Patterns & Workflows

### Stash Operations

```bash
# List all stashed changesets
git stash list

# Apply specific stash without removing it from stack
git stash apply stash@{0}

# Drop specific stash entry
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

### Advanced History Rewriting

```bash
# Squash or edit last 3 commits interactively
git rebase -i HEAD~3

# Abort rebase when merge conflicts become unmanageable
git rebase --abort

# Continue rebase after resolving conflict markers and staging files
git rebase --continue
```

### Git Worktrees: Parallel Branching Without Re-Cloning

Work on a hotfix or review a teammate's PR without modifying or stashing your current working directory:

```bash
# Create detached worktree at sibling path on existing or new branch
git worktree add ../hotfix-worktree fix/login-regression

# View all active worktree paths
git worktree list

# Remove worktree after completing work and deleting directory
git worktree remove ../hotfix-worktree
```

### Automated Binary Regression Hunting (`bisect`)

```bash
# Initialize bisect session
git bisect start

# Mark current commit as broken
git bisect bad

# Mark last known good release or commit
git bisect good v1.0.0

# Git checks out intermediate commits automatically
# Run tests, then mark each step:
git bisect good # If tests pass
git bisect bad  # If tests fail

# When finished, restore original branch state
git bisect reset
```

---

## 🔗 Related Documentation & Context

- [Runbook: Semantic Versioning & Release Tagging](./git-release-runbook.md)
- [Cheat Sheet: GitHub CLI (gh)](./gh-cheatsheet.md)
- [Cheat Sheet: Pre-Commit Framework](./pre-commit-cheatsheet.md)
- [Cheat Sheet: GitHub Actions CI/CD](./github-actions-cheatsheet.md)
