---
title: "[Topic / Tool Name] Cheat Sheet"
description: "High-density command reference, common flags, and practical CLI patterns for [Tool / Technology]."
sidebar:
  label: "[Short Title]"
  order: 10
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

<!--
DIÁTAXIS ARCHETYPE: REFERENCE / CHEAT SHEET
Target Audience: Practitioners who already know what they want to achieve and need instant syntax, flags, or configuration keys.
Tone: Objective, concise, tabular, low-narrative.
Filename Convention: <topic>-cheatsheet.md

CORE CONTRACT:
1. Frontmatter with descriptive title, 15 to 25 word description, and sidebar badge (text: "Cheat Sheet", variant: "note").
2. Tier 1 Top Pivot Bar immediately beneath frontmatter.
3. Tier 3 Related Documentation section at the bottom (## 🔗 Related Documentation & Context).

SUGGESTED MODULAR BODY BLOCKS (All Optional / Advisory):
The sections below are recommended patterns, not rigid requirements. Adapt, reorder, combine, or omit headings based on what best serves the topic.
- Quick start / one-liner examples
- Command / parameter / flag matrix tables
- Scoped workflow patterns with <details> for advanced nuances
- Configuration snippets (only when tool uses config files)
- Gotchas, pitfalls, and performance tips ([!TIP], [!WARNING])
-->

> 🔗 **Related**: [Runbook: Operational Setup](../path/to/procedure-runbook.md) · [Architecture: System Design](../path/to/system-explanation.md)

[1-2 sentence overview defining the tool, primary scope, and binary/CLI entry point].

---

## ⚡ Quick Start & Core Commands

```bash
# Basic execution example
command --flag argument

# Second common workflow
command sub-action --target value
```

---

## 📊 Command & Flag Matrix

| Command / Flag | Syntax      | Purpose / When Useful               |
| :------------- | :---------- | :---------------------------------- |
| `[flag/cmd]`   | `[example]` | [Concise description of the option] |
| `[flag/cmd]`   | `[example]` | [Concise description of the option] |

---

## 🛠️ Common Patterns & Workflows

### 1. [Workflow Scenario Name]

```bash
# Step 1: Description
tool-cli command --param value

# Step 2: Verification
tool-cli verify --output json
```

<details>
<summary>Deep-Dive: [Advanced Flag Mechanics / Underlying Logic]</summary>

Use collapsible blocks for background details, theory, or advanced edge-case parameters so the main table remains fast and scannable without bloat.

</details>

---

## ⚠️ Gotchas & Best Practices

> [!TIP]
> [High-value performance tip or shortcut]

Pay careful attention to destructive operations:

> [!WARNING]
> [Critical pitfall, deprecation note, or destructive flag caution]

---

## 🔗 Related Documentation & Context

- **Runbook**: [Step-by-Step Setup & Hardening](../path/to/procedure-runbook.md): Complete operational guide for deploying and maintaining this service.
- **Architecture**: [System Design & Rationale](../path/to/system-explanation.md): Topology diagrams, decision records, and component responsibilities.
