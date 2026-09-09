---
title: Contributing & Authoring Guide
description: Documentation architecture, Diátaxis content archetypes, page templates, and quality standards for Bum Scrolling.
---

Welcome to the **Bum Scrolling** authoring and contribution guide! This portal serves as an **Engineering Handbook & Operational Portal** covering cloud-native infrastructure, developer tooling, security, and Linux systems administration.

---

## 🧭 Documentation Architecture: The Canonical Hybrid Model

To balance **clean separation of concerns** with **real-world engineering workflows**, we adopt the **Canonical Hybrid Model** (pioneered by Canonical/Ubuntu and modern cloud-native portals).

Content is categorized along two orthogonal axes:

1. **Thematic Domains (Filesystem)**: Grouped by technology or capability area (`src/content/docs/<domain>/`).
2. **Diátaxis Archetypes (Navigation)**: Explicitly indicated in the sidebar with Starlight badges.

### Compact Archetype Comparison Matrix

| Archetype & Badge                    | User State                                                       | Orientation & Tone                                                    | Core Elements                                                            | Code Role                                                | Template                                                                                                                                |
| :----------------------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------- | :------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **`[Cheat Sheet]`**<br>`badge: note` | Mid-operation; needs syntax, flag, or command immediately.       | **Information-oriented**<br>Austere, factual, tabular, low-narrative. | Command matrices, parameter tables, flag options, gotchas.               | Direct copy-paste commands and CLI patterns.             | [`reference-cheatsheet.md`](https://github.com/bumuellp/bum-scrolling/blob/main/.github/page-templates/reference-cheatsheet.md)         |
| **`[Runbook]`**<br>`badge: success`  | Faced with a specific task, deployment, or operational incident. | **Task-oriented**<br>Prescriptive, sequential, outcome-driven.        | Prerequisites checklist, numbered steps, health checks, troubleshooting. | Execution commands, configuration blocks, test commands. | [`how-to-runbook.md`](https://github.com/bumuellp/bum-scrolling/blob/main/.github/page-templates/how-to-runbook.md)                     |
| **`[Architecture]`**<br>`badge: tip` | Evaluating system design, trade-offs, or component boundaries.   | **Understanding-oriented**<br>Discursive, conceptual, big-picture.    | Topologies, responsibility tables, design trade-offs, dependencies.      | Illustrative schemas, state models, protocol contracts.  | [`architecture-explanation.md`](https://github.com/bumuellp/bum-scrolling/blob/main/.github/page-templates/architecture-explanation.md) |

---

### Thematic Domain Pattern (Generic & Extensible)

Rather than maintaining a rigid, closed catalog of allowed directories, the repository follows a generic domain convention:

- **Domain Directory**: Group documentation by technical capability or subject area under `src/content/docs/<domain>/`.
  - _Current Examples_: `containers/`, `linux/`, `tools/`, `security/`, `architecture/`, `meta/`.
  - _Future Capabilities_: New capability domains (e.g. `networking/`, `storage/`, `observability/`, `ai/`) can be added freely as the engineering footprint expands.
- **Multi-Archetype Coexistence**: A single domain may host multiple archetypes (for example, `linux/wireguard.md` is a `[Runbook]`, while `linux/user-permissions.md` is a `[Cheat Sheet]`).
- **Navigation Registration**: Every page in a domain directory is assigned an archetype badge in [`astro.config.mjs`](astro.config.mjs).

---

## 🔗 The 3-Tier Synergy Linking Standard

To eliminate content duplication and keep cheat sheets lean without stranding users, all pages adhere to a 3-tier cross-linking pattern:

1. **Tier 1 — Top 1-Line Pivot Bar**:
   Immediately beneath the frontmatter, provide a compact link row to counterpart guides for 0-second bounce recovery:

   ```markdown
   > 🔗 **Related**: [Runbook: Operational Setup](../path/to/runbook.md) · [Architecture: System Design](../path/to/architecture.md)
   ```

2. **Tier 2 — In-Body Collapsible Disclosures (`<details><summary>`)**:
   Avoid bloating cheat sheets with extensive theory or verbose troubleshooting. Use native HTML `<details><summary>` disclosures or Starlight `collapse={...}` code blocks to make deep context available on-demand without slowing down visual scanning.

3. **Tier 3 — Bottom Related Documentation Section**:
   End every document with a standardized `## 🔗 Related Documentation & Context` heading. This automatically populates Starlight's right-hand **"On this page"** TOC on desktop.

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

- `> [!NOTE]` — Informational context, non-critical background, or helpful clarifications.
- `> [!TIP]` — High-value shortcuts, performance optimizations, or developer experience tips.
- `> [!IMPORTANT]` — Crucial instructions, required settings, or prerequisite configuration.
- `> [!WARNING]` — Deprecation notices, unexpected side effects, or configuration pitfalls.
- `> [!CAUTION]` — High-risk operational actions (data loss, network disconnects, firewall lockout).

### 3. Tables for Scannability

Tables are the preferred format for flags, parameters, and comparison data:

```markdown
| Flag / Option    | Default   | Purpose                              |
| :--------------- | :-------- | :----------------------------------- |
| `--bind-address` | `0.0.0.0` | Inbound IP address to bind listeners |
| `--node-ip`      | Required  | Advertised node address within mesh  |
```

---

## 📋 Page Templates

Instead of writing documents from scratch, copy the standardized template matching your Diátaxis archetype from [`.github/page-templates/`](https://github.com/bumuellp/bum-scrolling/tree/main/.github/page-templates):

| Archetype            | Template File                                                                                                                           | Included Structural Blocks                                                                                                                                                                                                                                   | Quick Copy Command                                                                          |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| **`[Cheat Sheet]`**  | [`reference-cheatsheet.md`](https://github.com/bumuellp/bum-scrolling/blob/main/.github/page-templates/reference-cheatsheet.md)         | • 1-line top pivot bar<br>• Core command quickstart<br>• Command & flag matrix<br>• Common workflows with `<details>` deep-dives<br>• Gotcha alerts (`[!TIP]`, `[!WARNING]`)<br>• Bottom related links                                                       | `cp .github/page-templates/reference-cheatsheet.md src/content/docs/<domain>/<name>.md`     |
| **`[Runbook]`**      | [`how-to-runbook.md`](https://github.com/bumuellp/bum-scrolling/blob/main/.github/page-templates/how-to-runbook.md)                     | • 1-line top pivot bar<br>• Prerequisites checklist<br>• Step-by-step procedures with alternative `<details>`<br>• Verification & health check commands<br>• Troubleshooting & incident remedies<br>• Security hardening checklist<br>• Bottom related links | `cp .github/page-templates/how-to-runbook.md src/content/docs/<domain>/<name>.md`           |
| **`[Architecture]`** | [`architecture-explanation.md`](https://github.com/bumuellp/bum-scrolling/blob/main/.github/page-templates/architecture-explanation.md) | • 1-line top pivot bar<br>• ASCII / Mermaid topology diagram<br>• Component responsibility matrix<br>• Illustrative code & configuration schemas<br>• Architectural decisions & trade-offs (ADR-style)<br>• Ecosystem dependencies<br>• Bottom related links | `cp .github/page-templates/architecture-explanation.md src/content/docs/<domain>/<name>.md` |

### Authoring Workflow with Templates

```bash
# 1. Copy the appropriate template into your target domain folder
cp .github/page-templates/reference-cheatsheet.md src/content/docs/tools/helm.md

# 2. Edit frontmatter, commands, and links
# 3. Register your new page and its archetype badge in astro.config.mjs
# 4. Verify locally
npm run dev
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
