---
title: Agent Skills CLI & Schema Cheat Sheet
description: Fast reference for the open skills CLI, multi-runtime agent targeting, SKILL.md schema, and cross-platform installation.
sidebar:
  label: "Skills CLI & Schema"
  order: 10
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Runbook: Custom Skill Authoring](./skill-authoring-runbook.md) · [Architecture: Agent Runtime & Progressive Disclosure](./agent-runtime-explanation.md) · [Architecture: Ecosystem Overview](../architecture/ecosystem-explanation.md)

The open Agent Skills standard ([skills.sh](https://skills.sh)) packages procedural capabilities, runbooks, and domain workflows into portable `SKILL.md` bundles. The `skills` CLI manages installation, updates, and agent targeting across multiple coding assistants.

---

## ⚡ Quick Start & Core Commands (`npx skills`)

```bash
# 1. Search the open registry for community skills
npx skills find writing

# 2. Install a skill package into the current project
npx skills add vercel-labs/agent-skills

# 3. Install a skill package from a custom GitHub repository
npx skills add bumuellp/00bum-licence-to-skill

# 4. Install Anthropic's official skill-creator meta-skill
npx skills add anthropics/skills --skill skill-creator

# 5. List installed skills across project and global scopes
npx skills list
npx skills list --global

# 6. Initialize a new skill scaffold
npx skills init my-workflow

# 7. Update all installed skills to latest versions
npx skills update --yes

# 8. Remove an installed skill
npx skills remove my-workflow
```

---

## 🎯 Multi-Runtime Agent Targeting

The `skills` CLI installs skills across different AI agent runtimes using the `-a` / `--agent` flag:

```bash
# Install to all supported agent runtimes in the project
npx skills add bumuellp/00bum-licence-to-skill --agent '*' --yes

# Install specifically for Claude Code and Cursor
npx skills add vercel-labs/agent-skills --agent claude-code --agent cursor

# Install globally for user profile across all projects
npx skills add anthropics/skills --skill skill-creator --global --agent claude-code --agent antigravity

# Copy skill files directly instead of creating symlinks
npx skills add bumuellp/00bum-licence-to-skill --copy --agent github-copilot
```

### Supported Runtime Identifiers

| Agent Identifier                  | Target Coding Assistant    | Default Skill Discovery Path                             |
| :-------------------------------- | :------------------------- | :------------------------------------------------------- |
| `claude-code`                     | Claude Code CLI            | `.claude/skills/` or `~/.claude/skills/`                 |
| `cursor`                          | Cursor IDE                 | `.cursor/skills/` or `.agents/skills/`                   |
| `antigravity` / `antigravity-cli` | Google Antigravity (`agy`) | `.agents/skills/` or `~/.gemini/antigravity-cli/skills/` |
| `github-copilot`                  | GitHub Copilot             | `.github/skills/` or `.agents/skills/`                   |
| `openhands`                       | OpenHands                  | `.openhands/skills/` or `.agents/skills/`                |
| `hermes-agent`                    | Hermes Agent               | `.hermes/skills/` or `.agents/skills/`                   |
| `windsurf`                        | Codeium Windsurf           | `.windsurf/skills/` or `.agents/skills/`                 |
| `universal`                       | Generic fallback           | `.agents/skills/`                                        |

---

## 📊 Command & Flag Matrix

| Command / Flag       | Syntax Example                            | Purpose                                                      |
| :------------------- | :---------------------------------------- | :----------------------------------------------------------- |
| `add`                | `npx skills add <repo>`                   | Clones and registers a skill package.                        |
| `-g, --global`       | `npx skills add <repo> -g`                | Installs at user level rather than repository root.          |
| `-a, --agent <id>`   | `npx skills add <repo> -a claude-code`    | Targets specific assistant runtimes (`*` for all).           |
| `-s, --skill <name>` | `npx skills add <repo> -s pr-review`      | Installs only selected skills from a multi-skill repository. |
| `-l, --list`         | `npx skills add <repo> -l`                | Previews available skills in a repo without installing.      |
| `--copy`             | `npx skills add <repo> --copy`            | Writes standalone file copies rather than symlinks.          |
| `--all`              | `npx skills add <repo> --all`             | Shorthand for `--skill '*' --agent '*' -y`.                  |
| `use`                | `npx skills use <repo>@<skill> \| claude` | Pipes a one-off prompt without saving to disk.               |
| `find`               | `npx skills find <term> --owner vercel`   | Filters public skill registry search by GitHub owner.        |
| `update`             | `npx skills update -g`                    | Synchronizes installed skills to latest upstream commits.    |

---

## 📝 `SKILL.md` Schema & Structure

Every skill requires a root `SKILL.md` file with YAML frontmatter:

```markdown
---
name: homelab-deploy
description: >-
  Deploys, validates, and rolls back container services across homelab hosts.
  Use when deploying Docker Compose stacks, restarting systemd units, or triaging failed containers.
version: 1.0.0
license: MIT
compatibility: Universal (Claude Code, Cursor, Antigravity, Copilot, OpenHands)
metadata:
  author: DevOps
  repository: https://github.com/bumuellp/00bum-licence-to-skill
  tags: docker compose homelab deployment
---

# Homelab Deployment Workflow

Operational instructions and execution steps follow here.
```

### Frontmatter Fields

| Field           | Type     | Required | Purpose                                                        |
| :-------------- | :------- | :------- | :------------------------------------------------------------- |
| `name`          | `string` | **Yes**  | Unique identifier (lowercase alphanumeric, hyphens allowed).   |
| `description`   | `string` | **Yes**  | Semantic trigger text scanned by agents during prompt routing. |
| `version`       | `string` | No       | Semantic version string (`MAJOR.MINOR.PATCH`).                 |
| `license`       | `string` | No       | SPDX license identifier (e.g., `MIT`, `Apache-2.0`).           |
| `compatibility` | `string` | No       | Target runtime notes or minimum model capabilities.            |
| `metadata`      | `map`    | No       | Arbitrary key-value metadata (author, tags, repo URL).         |

---

## ⚠️ Gotchas & Best Practices

> [!TIP]
> When maintaining a team or personal skill library, store all skill definitions in a dedicated Git repository. This allows single-command installation into any active workspace via `npx skills add <owner>/<repo>`.

Pay attention to filesystem isolation boundaries:

> [!WARNING]
> Symlinked skills (`default behavior of npx skills add`) require target files to exist on the host filesystem. If running agents inside isolated Docker containers or ephemeral CI workers, use the `--copy` flag to avoid broken symlinks.

---

## 🔗 Related Documentation & Context

- **Runbook**: [Custom Skill Authoring](./skill-authoring-runbook.md): Step-by-step authoring workflow, trigger optimization, and Anthropic `skill-creator` integration.
- **Architecture**: [Agent Runtime & Progressive Disclosure](./agent-runtime-explanation.md): Token budgets, context isolation, and comparison with MCP servers and rules.
- **Ecosystem**: [Ecosystem Overview](../architecture/ecosystem-explanation.md): High-level topology of homelab and developer tooling repositories.
- **Skill Repository**: [00bum-licence-to-skill](https://github.com/bumuellp/00bum-licence-to-skill): Personal catalog of reusable agent skills.
- **Upstream Registry**: [Agent Skills Directory (skills.sh)](https://skills.sh): Global index of public community skills.
