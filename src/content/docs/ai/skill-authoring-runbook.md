---
title: Custom Skill Authoring Runbook
description: Step-by-step operational guide for designing, evaluating, testing, and publishing portable agent skills across AI coding runtimes.
sidebar:
  label: "Authoring Skills"
  order: 20
  badge:
    text: "Runbook"
    variant: "success"
---

> 🔗 **Related**: [Cheat Sheet: Skills CLI & Schema](./agent-skills-cheatsheet.md) · [Architecture: Agent Runtime & Progressive Disclosure](./agent-runtime-explanation.md) · [Architecture: Ecosystem Overview](../architecture/ecosystem-explanation.md)

This runbook guides engineers through scaffolding, crafting, evaluating, and packaging reusable agent skills. Skills follow the open [skills.sh](https://skills.sh) standard and operate across all supported agent runtimes (Claude Code, Cursor, Google Antigravity, GitHub Copilot, OpenHands).

---

## 📋 Prerequisites & Requirements

Before authoring custom skills, verify the local development environment:

- [ ] Node.js v18+ and `npx` installed on host system
- [ ] At least one AI agent CLI or IDE extension installed (Claude Code, Cursor, Antigravity `agy`, etc.)
- [ ] Git installed for repository version control
- [ ] Optional: Target skills repository cloned locally (e.g., [`00bum-licence-to-skill`](https://github.com/bumuellp/00bum-licence-to-skill))

---

## 🚀 Step-by-Step Authoring Procedure

### Step 1: Initialize the Skill Directory Layout

Navigate to your custom skills repository or project root and generate the skill skeleton:

```bash
# Option A: Scaffold interactively using the skills CLI
npx skills init homelab-backup

# Option B: Create the directory layout manually
mkdir -p homelab-backup/{scripts,references}
touch homelab-backup/SKILL.md
```

The resulting filesystem layout accommodates instructions, executable scripts, and background reference manuals:

```text
homelab-backup/
├── SKILL.md                 # Primary instruction entrypoint (required)
├── scripts/                 # Deterministic helper scripts (optional)
│   └── verify-backup.sh
└── references/              # Extended schemas, error codes, tables (optional)
    └── restic-options.md
```

### Step 2: Bootstrap with Anthropic's `skill-creator`

Anthropic provides an official meta-skill designed to draft, refine, and evaluate new skills with systematic benchmarks rather than guesswork.

```bash
# Install skill-creator into your active agent environment
npx skills add anthropics/skills --skill skill-creator --agent '*' --yes
```

Prompt your AI coding assistant to design the skill specification:

```text
Use skill-creator to draft a new skill named "homelab-backup".
It should instruct agents how to take Restic snapshots, prune stale revisions,
and verify backup repository integrity across SSH sftp targets.
```

The `skill-creator` workflow assists with:

1. Generating accurate YAML frontmatter and operational sections.
2. Formulating targeted trigger phrases for the `description` field.
3. Constructing evaluation test cases to confirm consistent tool invocation.

### Step 3: Engineer High-Recall Trigger Descriptions

Agent runtimes determine whether to load a skill by evaluating user requests against the `description` field in the frontmatter. Poorly scoped descriptions cause either under-activation (agent ignores the skill) or over-activation (agent loads the skill unnecessarily, wasting token budget).

```yaml
---
name: homelab-backup
description: >-
  Manage and verify Restic backup snapshots across local disks and remote SFTP repositories.
  Use when asked to "create a backup", "verify backup integrity", "prune snapshots",
  or "restore homelab volumes". Do not use for general database migrations or git commits.
version: 1.0.0
license: MIT
metadata:
  author: DevOps
  repository: https://github.com/bumuellp/00bum-licence-to-skill
  tags: restic backup homelab
---
```

Key principles for trigger engineering:

- **Explicit Action Verbs**: Use exact verbs users type (`deploy`, `backup`, `triage`, `prune`, `restore`).
- **Trigger Synonyms**: Quote user phrases directly (`"verify backup integrity"`, `"check snapshot"`).
- **Negative Constraints**: State explicitly what the skill does not handle (`Do not use for general database migrations`).

### Step 4: Author the Procedural Body (`SKILL.md`)

Write instructions optimized for deterministic tool calling. Use imperative steps, explicit command templates, and verification checks:

````markdown
# Homelab Backup & Snapshot Workflow

Follow this procedure when creating or maintaining Restic repository backups.

## 1. Verify Repository Access

Before running backup operations, confirm access to the target backup repository:

```bash
restic check --no-lock
```

## 2. Execute Snapshot

Create a snapshot including host volume definitions while excluding socket files:

```bash
restic backup /var/homelab \
  --exclude="*.sock" \
  --exclude="cache/" \
  --tag "scheduled"
```

## 3. Verify Snapshot Creation

Confirm the new snapshot appears in the revision list:

```bash
restic snapshots --tag "scheduled" --latest 1
```
````

<details>
<summary>Best Practice: Moving Complex Logic into Helper Scripts</summary>

Avoid embedding long multi-line bash or python scripts directly inside markdown prose. Place them in `scripts/run-backup.sh` and instruct the agent to execute the file:

````markdown
Execute the verification script to validate checksums:

```bash
./scripts/verify-checksums.sh --path /var/homelab
```
````

This reduces token consumption in the context window and prevents transcription syntax bugs.

</details>

### Step 5: Test and Validate Across Target Runtimes

Test skill discovery locally across your installed assistants before publishing:

```bash
# Link local skill into all agent configuration folders
npx skills add . --agent '*' --copy

# Check registration status across agents
npx skills list --agent '*'
```

Launch your preferred assistant (`claude`, `cursor`, `agy`, or `copilot`) and run a prompt matching your trigger phrase. Confirm that the assistant identifies and reads the skill file during its planning phase.

### Step 6: Commit and Publish to a Skill Repository

When publishing to a personal or team skill registry (such as [`00bum-licence-to-skill`](https://github.com/bumuellp/00bum-licence-to-skill)):

```bash
# 1. Verify repository structure
git status

# 2. Stage new skill directory
git add homelab-backup/

# 3. Commit using conventional commit format
git commit -m "feat(skills): add homelab-backup skill"

# 4. Push to remote
git push origin main
```

Colleagues or other workstations can now install your skill directly:

```bash
npx skills add bumuellp/00bum-licence-to-skill --skill homelab-backup --agent '*'
```

---

## ✅ Verification & Health Checks

Verify skill formatting and multi-agent availability with these commands:

```bash
# 1. Verify frontmatter and file existence
test -f homelab-backup/SKILL.md && echo "SKILL.md exists"

# 2. Validate YAML frontmatter integrity
head -n 20 homelab-backup/SKILL.md

# 3. Verify executable permissions on helper scripts
find homelab-backup/scripts/ -type f -name "*.sh" -exec test -x {} \; -print
```

---

## 🛠️ Troubleshooting & Incident Remedies

| Failure Mode                         | Probable Cause                                                | Remediation                                                                |
| :----------------------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------------- |
| **Agent ignores skill**              | `description` too abstract; missing exact keyword match.      | Add quoted colloquial user trigger phrases into frontmatter `description`. |
| **Skill loads on unrelated prompts** | `description` is too generic (e.g., "Assists with code").     | Add negative boundaries (`Do not use when...`) and domain-specific verbs.  |
| **Helper script permission denied**  | Script lacks executable bit (`+x`).                           | Run `chmod +x homelab-backup/scripts/*.sh`.                                |
| **Broken symlink in Docker/remote**  | Agent runs in container without access to original host path. | Re-install using `npx skills add <source> --copy` instead of symlinks.     |

---

## 🔒 Security Hardening Checklist

- [ ] **No Hardcoded Secrets**: Ensure `SKILL.md`, scripts, and reference files contain zero private API tokens, private keys, or credentials.
- [ ] **Sanitized Path References**: Use environment variables or relative placeholders (`<PATH_TO_CONFIG>`, `/var/homelab`) rather than hardcoded personal home directories.
- [ ] **Defensive Scripting**: Shell scripts in `scripts/` must begin with `set -euo pipefail` to abort immediately upon error.
- [ ] **Read-Only Scope Where Possible**: Mark verification and audit commands clearly so agents default to non-destructive inspections.

---

## 🔗 Related Documentation & Context

- **Cheat Sheet**: [Skills CLI & Schema](./agent-skills-cheatsheet.md): Complete CLI flags and frontmatter schema matrix.
- **Architecture**: [Agent Runtime & Progressive Disclosure](./agent-runtime-explanation.md): Token economics and progressive disclosure mechanics.
- **Skills Repository**: [00bum-licence-to-skill](https://github.com/bumuellp/00bum-licence-to-skill): Reusable homelab and agent automation skills.
- **Anthropic Skills**: [anthropics/skills](https://github.com/anthropics/skills): Official collection including `skill-creator`.
