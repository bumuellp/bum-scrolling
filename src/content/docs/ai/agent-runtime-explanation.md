---
title: Agent Runtime & Progressive Disclosure Architecture
description: Architectural analysis of AI agent skill execution, context token economics, progressive disclosure lifecycle, and customization taxonomy.
sidebar:
  label: "Runtime & Progressive Disclosure"
  order: 30
  badge:
    text: "Architecture"
    variant: "tip"
---

> 🔗 **Related**: [Cheat Sheet: Skills CLI & Schema](./agent-skills-cheatsheet.md) · [Runbook: Custom Skill Authoring](./skill-authoring-runbook.md) · [Architecture: Ecosystem Overview](../architecture/ecosystem-explanation.md)

Modern AI coding assistants (such as Claude Code, Cursor, Google Antigravity, GitHub Copilot, and OpenHands) operate under finite context window limits and attention degradation curves. When operational runbooks, repository rules, prompt templates, and tool schemas are injected simultaneously into a monolithic system prompt, agent reasoning degrades, hallucination rates climb, and context costs escalate.

The open Agent Skills architecture ([skills.sh](https://skills.sh)) solves this bottleneck through **progressive disclosure**, decoupling lightweight capability discovery from heavyweight instruction execution.

---

## 🏛️ Context Economics & The Progressive Disclosure Pattern

Monolithic prompt injection forces an LLM to attend to every possible operational workflow simultaneously, regardless of whether the user is asking to write a unit test, debug a network socket, or deploy an infrastructure stack.

```text
Monolithic Context Model (High Overhead & Distraction):
+-----------------------------------------------------------------------+
| System Prompt: Base Model Instructions                                |
| + Complete Docker Runbook (2,000 tokens)                              |
| + Complete Kubernetes Runbook (4,000 tokens)                          |
| + Complete Database Migration Runbook (3,500 tokens)                  |
| + Complete Security Audit Runbook (3,000 tokens)                      |
| + ... 25 Additional Runbooks (40,000 tokens)                          |
+-----------------------------------------------------------------------+
| Active Conversation & Code Context (Budget Heavily Constrained)       |
+-----------------------------------------------------------------------+

Progressive Disclosure Model (Lightweight Index & On-Demand Mounting):
+-----------------------------------------------------------------------+
| System Prompt: Base Model Instructions                                |
| + Metadata Index: 30 skills (names + descriptions only: ~900 tokens)  |
+-----------------------------------------------------------------------+
| Active Conversation & Code Context (Preserved Context Capacity)       |
+-----------------------------------------------------------------------+
                                    |
          User prompt matches skill description trigger
                                    v
+-----------------------------------------------------------------------+
| Dynamically Mounted: ONLY matching SKILL.md body (1,500 tokens)       |
+-----------------------------------------------------------------------+
```

### The 4-Stage Progressive Disclosure Lifecycle

```text
+------------------------+
| 1. Metadata Indexing   |  CLI or agent scans skill directories. Only YAML frontmatter
+------------------------+  (name and description) is registered in the routing catalog.
            |
            v
+------------------------+
| 2. Intent Routing      |  User prompt is evaluated against skill descriptions.
+------------------------+  No skill instruction bodies are loaded into context.
            |
            v
+------------------------+
| 3. On-Demand Mounting  |  When semantic intent matches a skill description, the agent
+------------------------+  executes a tool call (e.g. view_file) to load the SKILL.md body.
            |
            v
+------------------------+
| 4. Bounded Execution   |  Agent executes instructions, optionally calling helper scripts
+------------------------+  or reading deep reference files in references/ as needed.
```

---

## 🧩 Customization Taxonomy: Skills vs Rules vs MCP vs Hooks

AI coding assistants provide multiple customization primitives. Selecting the appropriate primitive preserves context space and ensures predictable agent behavior:

| Customization Type  | File Format / Contract                           | Context Cost                                | Scope & Trigger                        | Primary Responsibility                                                                                     |
| :------------------ | :----------------------------------------------- | :------------------------------------------ | :------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **Skills**          | `SKILL.md` (Markdown + YAML)                     | **Low** (Progressive)                       | Dynamic semantic intent matching       | Procedural workflows, operational runbooks, multi-step diagnostics, and domain-specific recipes.           |
| **Rules**           | `AGENTS.md`<br>`GEMINI.md`<br>`.cursorrules`     | **High** (Loaded globally or per directory) | Static path traversal or always active | Immutable constraints, coding conventions, prohibited libraries, formatting contracts, and security rules. |
| **MCP Servers**     | Model Context Protocol (JSON-RPC over STDIO/SSE) | **Moderate** (Tool schema overhead)         | Dynamic tool execution                 | Live system integrations and data access layers (databases, issue trackers, live APIs, cloud SDKs).        |
| **Lifecycle Hooks** | Shell scripts (`hooks.json`)                     | **Zero** (Out of band)                      | Deterministic agent lifecycle points   | Deterministic enforcement and telemetry (pre-commit validation, automatic code formatting, audit logging). |

---

## ⚖️ Key Architectural Decisions & Trade-Offs

### Decision 1: Imperative Markdown vs Structured Execution Graphs

- **Context**: Autonomous workflow engines often specify multi-step agent plans using structured JSON or YAML execution graphs (DAGs).
- **Rationale**: Modern LLMs follow imperative natural language markdown with greater adaptability than rigid JSON state machines. Markdown allows error handling, alternative branches, and contextual heuristics to be expressed naturally.
- **Accepted Trade-Off**: Natural language runbooks carry non-zero variance. Where strict determinism is mandatory (such as cryptographic checksum validation or multi-command rollbacks), logic is delegated to executable shell or Python scripts inside `scripts/`, which the agent executes via standard terminal tools.

### Decision 2: Progressive Mounting vs Global Pre-Loading

- **Context**: Small repositories often default to concatenating all documentation into a single global prompt (`CLAUDE.md` or `AGENTS.md`).
- **Rationale**: While simple initially, context degradation accelerates as the documentation footprint expands. Isolating procedures into discrete `SKILL.md` files maintains near-constant base token overhead regardless of total capability count.
- **Accepted Trade-Off**: Introduces a single tool call round-trip latency when mounting a skill during execution.

### Decision 3: Filesystem Symlinks vs Isolated File Copies (`--copy`)

- **Context**: The `skills` package manager can link skills via filesystem symlinks or standalone copies.
- **Rationale**: Symlinking enables instant propagation of skill edits across local workspace folders.
- **Accepted Trade-Off**: Symlinks fail across container mount boundaries, remote development containers, and sandboxed CI runners. Packaging pipelines targeting isolated runtimes require `--copy` to ensure complete file self-containment.

---

## 🌐 Multi-Runtime Portability & The Open Standard

The `skills.sh` open specification provides a vendor-neutral contract across previously fragmented agent configurations:

```text
                        +----------------------------+
                        |   Universal Skill Bundle   |
                        |   <name>/                  |
                        |   ├── SKILL.md             |
                        |   ├── scripts/             |
                        |   └── references/          |
                        +----------------------------+
                                      |
                      npx skills add --agent <target>
                                      |
        +-----------------------------+-----------------------------+
        |                             |                             |
        v                             v                             v
+-------------------+       +-------------------+       +-------------------+
|    Claude Code    |       |    Cursor IDE     |       |    Antigravity    |
|   .claude/skills/ |       |   .cursor/skills/ |       |  .agents/skills/  |
+-------------------+       +-------------------+       +-------------------+
```

By standardizing on portable filesystem layouts, organizations maintain a single central repository of operational capabilities that functions identically across command-line agents and graphical IDEs.

---

## 🔗 Related Documentation & Context

- **Cheat Sheet**: [Skills CLI & Schema](./agent-skills-cheatsheet.md): Command matrix, agent runtime flags, and frontmatter parameters.
- **Runbook**: [Custom Skill Authoring](./skill-authoring-runbook.md): Step-by-step authoring guide, trigger engineering, and validation.
- **Upstream Registry**: [Agent Skills Directory (skills.sh)](https://skills.sh): Central registry of open community skills.
- **Model Context Protocol**: [MCP Documentation](https://modelcontextprotocol.io/): Specification for dynamic external tool servers.
