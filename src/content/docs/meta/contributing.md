---
title: Contributing & Authoring Guide
description: Documentation architecture, Diátaxis content archetypes, page templates, and quality standards for Bum Scrolling.
---

Welcome to the **Bum Scrolling** authoring and contribution guide! This portal serves as an **Engineering Handbook & Operational Portal** covering cloud-native infrastructure, developer tooling, security, and Linux systems administration.

---

## 🧭 Documentation Architecture: The Diátaxis Framework

To maintain consistency and high utility across hundreds of documents, we adopt the [Diátaxis framework](https://diataxis.fr/). Every document in this portal serves a specific user need and belongs to one of three primary archetypes:

```
                      PRACTICAL / WORK-ORIENTED
                                 │
           How-To Guides         │         Reference / Cheat Sheets
           (Operational Steps)   │         (Facts & Commands)
      ───────────────────────────┼───────────────────────────
           Architecture          │         Tutorials
           (System Explanations) │         (Learning Journeys)
                                 │
                     THEORETICAL / STUDY-ORIENTED
```

### 1. Reference & Cheat Sheets (`cheat-sheets/`, `tools/`)
- **User State**: In the middle of an operation, needs a command flag, syntax structure, or API endpoint immediately.
- **Orientation**: Information-oriented.
- **Tone**: Austere, factual, scannable, low-narrative.
- **Core Elements**: Fast command snippets, comparison tables, flag matrices, and gotcha callouts.

### 2. Operational Runbooks & How-To Guides (`linux/`, `security/`)
- **User State**: Faced with a real-world task or operational goal (e.g. configuring a WireGuard mesh or hardening SSH).
- **Orientation**: Task-oriented.
- **Tone**: Prescriptive, sequential, outcome-driven.
- **Core Elements**: Prerequisites checklist, numbered execution steps, explicit verification commands, and troubleshooting remedies.

### 3. Architecture & System Explanations (`architecture/`)
- **User State**: Studying the system design, evaluating design trade-offs, or understanding how components interact.
- **Orientation**: Understanding-oriented.
- **Tone**: Discursive, conceptual, big-picture.
- **Core Elements**: ASCII/Mermaid topologies, component responsibility tables, architectural trade-offs, and dependency maps.

---

## 📑 Required Page Anatomy & Frontmatter

Every markdown file in `src/content/docs/` requires valid YAML frontmatter at the very top:

```yaml
---
title: "Descriptive Page Title"
description: "A single-sentence, search-optimized summary of what this document covers."
---
```

### Frontmatter Rules
- **`title`**: Concise, capitalized, without markdown formatting or trailing punctuation.
- **`description`**: Required for search indexing (Pagefind) and SEO meta tags. Must accurately describe the page content in 15–25 words.

---

## 🎨 Content & Formatting Standards

### 1. Code Blocks & Syntax Highlighting
- **Always specify language identifiers** (e.g. `bash`, `yaml`, `json`, `text`, `ini`).
- **Include descriptive comments** above complex or multi-flag commands.
- **Maintain empty lines** before and after all fenced code blocks (`MD031` compliance).

```bash
# Verify listening sockets on the WireGuard interface
ss -tulpn | grep 51820
```

### 2. GitHub-Flavored Alerts & Callouts
Use alerts to highlight critical operational context. Do not nest alerts or use them excessively:

> [!NOTE]
> Informational context, non-critical background, or helpful clarifications.

> [!TIP]
> High-value shortcuts, performance optimizations, or developer experience tips.

> [!IMPORTANT]
> Crucial instructions, required settings, or prerequisite configuration.

> [!WARNING]
> Deprecation notices, unexpected side effects, or configuration pitfalls.

> [!CAUTION]
> High-risk operational actions (data loss, network disconnects, firewall lockout).

### 3. Tables for Scannability
Tables are the preferred format for flags, parameters, and comparison data:

```markdown
| Flag / Option | Default | Purpose |
| :--- | :--- | :--- |
| `--bind-address` | `0.0.0.0` | Inbound IP address to bind listeners |
| `--node-ip` | Required | Advertised node address within mesh |
```

---

## 📋 Page Templates

Copy the relevant template from `.github/page-templates/` to start a new document:

### Template 1: Reference / Cheat Sheet
Use for CLI tools, flags, command catalogs, and syntax summaries.

```markdown
---
title: "[Tool Name] Cheat Sheet"
description: "High-density command reference, common flags, and practical CLI patterns for [Tool]."
---

[1-2 sentence overview defining the tool and primary entry point].

---

## ⚡ Quick Start & Core Commands

```bash
# [Basic execution example]
command --flag argument
```

---

## 📊 Command & Flag Matrix

| Command / Flag | Syntax | Purpose / When Useful |
| :--- | :--- | :--- |
| `[flag]` | `[example]` | [Description] |

---

## 🛠️ Common Patterns & Workflows

### 1. [Workflow Scenario Name]

```bash
# Step 1: [Short description]
tool-cli command --param value
```

---

## ⚠️ Gotchas & Best Practices

> [!TIP]
> [High-value performance tip or shortcut]
```

### Template 2: Operational Runbook / How-To
Use for infrastructure setups, service installations, and security hardening procedures.

```markdown
---
title: "[Procedure Name] Runbook"
description: "Step-by-step operational runbook for configuring and maintaining [System/Service]."
---

[1-2 sentences stating the operational goal].

---

## 📋 Prerequisites & Requirements

- [ ] Target OS: [e.g. Ubuntu 24.04 LTS]
- [ ] Required packages: `[package-name]`
- [ ] Network access / firewall requirements

---

## 🚀 Step-by-Step Procedure

### Step 1: [Preparation]
```bash
sudo apt-get update && sudo apt-get install -y [package]
```

### Step 2: [Configuration]
```yaml
# /path/to/config.yaml
setting: enabled
```

---

## ✅ Verification & Health Checks

```bash
# Check service status
sudo systemctl status [service].service --no-pager
```

---

## 🔍 Troubleshooting & Incident Response

### Issue: [Symptom Name]
- **Cause**: [Root cause explanation]
- **Remedy**: [Actionable fix command]
```

### Template 3: Architecture / System Explanation
Use for system design overviews, cross-repository tooling integrations, and architectural decisions.

```markdown
---
title: "[System Name] Architecture"
description: "Design philosophy, component topology, and lifecycle workflows for [System]."
---

[1-2 paragraphs introducing the subsystem and its design principles].

---

## 🏛️ System Overview & High-Level Architecture

[ASCII or Mermaid diagram depicting request lifecycle or topology].

---

## 🧩 Core Components & Responsibilities

| Component | Responsibility | Boundary / Interface |
| :--- | :--- | :--- |
| `[Component]` | [Primary function] | [API / IPC] |

---

## ⚖️ Key Architectural Decisions & Trade-Offs

### Decision 1: [Rationale for Technology Choice]
- **Context**: [Problem description]
- **Rationale**: [Why this pattern was chosen]
- **Trade-Offs**: [Mitigations for downsides]
```

---

## 🔒 Privacy & Sanitization Guidelines

As a public repository, all contributions must strictly preserve environmental privacy:
- **No Private Repositories**: Use generic or public ecosystem references only.
- **Sanitize IP Addresses**: Use documentation IP ranges (RFC 5737: `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) or standard private subnets (`10.0.0.0/8`, `192.168.0.0/16`).
- **Generic Hostnames**: Use `example.com`, `node-1.internal`, or `cluster.local`.
- **Mask Tokens & Secrets**: Use placeholders (`<API_TOKEN>`, `ghp_...`).

---

## 🚀 Authoring Workflow & Pull Request Checklist

1. **Copy Template**: Choose from `.github/page-templates/` and place in the appropriate directory.
2. **Register Route**: Add the page slug to [`astro.config.mjs`](astro.config.mjs) under the relevant sidebar group.
3. **Run Pre-Commit Checks**:
   ```bash
   uvx pre-commit run --all-files
   ```
4. **Build & Verify Locally**:
   ```bash
   npm run build
   ```
5. **Commit with Conventional Commits**:
   ```bash
   git commit -m "feat(docs): add wireguard mesh routing runbook"
   ```
