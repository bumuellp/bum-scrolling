# Contributing to Bum Scrolling

Thank you for contributing to **Bum Scrolling**! This project serves as an **Engineering Handbook & Operational Portal** for cloud-native infrastructure, developer tooling, security, and Linux administration.

---

## 🧭 Content Framework: Canonical Hybrid Diátaxis

To balance **clean separation of concerns** with **practical engineer workflows**, we adopt the **Canonical Hybrid Model** (the approach used by Canonical/Ubuntu and modern documentation portals).

Content is categorized along two orthogonal axes:

1. **Thematic Domains (Filesystem)**: Organized by capability under `src/content/docs/<domain>/`.
2. **Diátaxis Archetypes (Navigation)**: Explicitly badged in the sidebar.

### Compact Archetype Comparison Matrix

| Archetype & Badge                    | User State                                                       | Orientation & Tone                                                    | Core Elements                                                            | Code Role                                                | Template                                                                            |
| :----------------------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------- | :------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **`[Cheat Sheet]`**<br>`badge: note` | Mid-operation; needs syntax, flag, or command immediately.       | **Information-oriented**<br>Austere, factual, tabular, low-narrative. | Command matrices, parameter tables, flag options, gotchas.               | Direct copy-paste commands and CLI patterns.             | [`reference-cheatsheet.md`](.github/page-templates/reference-cheatsheet.md)         |
| **`[Runbook]`**<br>`badge: success`  | Faced with a specific task, deployment, or operational incident. | **Task-oriented**<br>Prescriptive, sequential, outcome-driven.        | Prerequisites checklist, numbered steps, health checks, troubleshooting. | Execution commands, configuration blocks, test commands. | [`how-to-runbook.md`](.github/page-templates/how-to-runbook.md)                     |
| **`[Architecture]`**<br>`badge: tip` | Evaluating system design, trade-offs, or component boundaries.   | **Understanding-oriented**<br>Discursive, conceptual, big-picture.    | Topologies, responsibility tables, design trade-offs, dependencies.      | Illustrative schemas, state models, protocol contracts.  | [`architecture-explanation.md`](.github/page-templates/architecture-explanation.md) |

### Thematic Domain Organization (Generic)

Directories under `src/content/docs/` correspond to technological capabilities (e.g. `containers/`, `linux/`, `tools/`, `security/`, `architecture/`). Contributors can introduce new capability areas (such as `networking/` or `observability/`) as the infrastructure evolves, registering them in [`astro.config.mjs`](astro.config.mjs).

---

## 🔗 The 3-Tier Synergy Linking Standard

To eliminate content duplication and keep cheat sheets lean without stranding users, all pages adhere to a 3-tier cross-linking pattern:

1. **Tier 1 — Top 1-Line Pivot Bar**:
   Immediately beneath the frontmatter, provide a compact link row to counterpart guides for 0-second bounce recovery:

   ```markdown
   > 🔗 **Related**: [Runbook: Operational Setup](../path/to/runbook.md) · [Architecture: System Design](../path/to/architecture.md)
   ```

2. **Tier 2 — In-Body Collapsible Disclosures (`<details><summary>`)**:
   Avoid bloating cheat sheets with extensive theory or verbose troubleshooting. Use native HTML disclosures or Starlight `collapse={...}` code blocks to make deep context available on-demand without slowing down visual scanning.
3. **Tier 3 — Bottom Related Documentation Section**:
   End every document with a standardized `## 🔗 Related Documentation & Context` heading. This automatically populates Starlight's right-hand **"On this page"** TOC on desktop.

---

## 📋 Page Templates

When contributing new content, copy the corresponding template from [`.github/page-templates/`](.github/page-templates/):

| Template                       | File                                                                                | When to Use                                                                     |
| :----------------------------- | :---------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **Reference / Cheat Sheet**    | [`reference-cheatsheet.md`](.github/page-templates/reference-cheatsheet.md)         | High-density command matrices, syntax tables, and CLI patterns.                 |
| **Operational Runbook**        | [`how-to-runbook.md`](.github/page-templates/how-to-runbook.md)                     | Step-by-step procedures with prerequisites, health checks, and fixes.           |
| **Architecture & Explanation** | [`architecture-explanation.md`](.github/page-templates/architecture-explanation.md) | System design, component boundaries, trade-offs, and illustrative code schemas. |

> [!TIP]
> Foundational code snippets, configuration schemas, and data structures are **actively encouraged** in Architecture documents to concretely demonstrate contracts and system mechanics.

---

## 🛠️ Local Development Workflow

This portal is built using [Astro Starlight](https://starlight.astro.build/).

### 1. Prerequisites

- **Node.js**: v20 or v24 LTS (defined in `.node-version`)
- **Package Manager**: npm
- **Python / UV**: For running `pre-commit` hooks locally

### 2. Setup & Preview

```bash
# Clone the repository
git clone https://github.com/bumuellp/bum-scrolling.git
cd bum-scrolling

# Install dependencies
npm install

# Start local development server with hot module reload
npm run dev

# Build static production assets and verify Pagefind search indexing
npm run build

# Preview production build locally
npm run preview
```

---

## 🚦 Shift-Left Quality & Pre-Commit Tooling

All contributions must pass automated pre-commit linters and security checks before submission.

### 1. Install Pre-Commit Hooks

```bash
# Install git hooks into local .git/hooks directory
uvx pre-commit install --hook-type pre-commit --hook-type commit-msg --hook-type pre-push
```

### 2. Manual Verification

Before creating a pull request, run all linters across all tracked files:

```bash
uvx pre-commit run --all-files
```

The pre-commit pipeline verifies:

- **Markdown & Formatting**: `prettier` and `markdownlint-cli2`.
- **YAML & Workflows**: `check-yaml` and `check-github-workflows`.
- **Secrets Scanning**: `secret-scan` (TruffleHog) to prevent leaked tokens and keys.
- **Security & Vulnerabilities**: `trivy-fs` for CVE auditing across files and dependencies.
- **Commit Messages**: `commit-msg` enforcing Conventional Commits.

---

## 📜 Git & Commit Standards

### 1. Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short description>
```

- **Allowed Types**: `feat`, `fix`, `docs`, `chore`, `refactor`, `style`, `test`, `ci`.
- **Common Scopes**: `docs`, `tools`, `linux`, `security`, `architecture`, `deps`.
- **Examples**:
  - `feat(docs): add opentelemetry collector cheat sheet`
  - `fix(linux): correct ufw default routing rule for wg0`
  - `docs(tools): update ruff pre-commit flags`

### 2. Branching & PRs

- Branch from `main` using descriptive names: `feat/wireguard-mesh`, `fix/selinux-typo`.
- Open a Pull Request against `main`. Ensure all automated CI checks pass.

---

## 🔒 Anonymity, Privacy & Sanitization Guidelines

As a public documentation and engineering portal, all content must strictly maintain environmental privacy:

1. **No Private Repositories**: Do not reference internal or private repository names. Use generic or public ecosystem references.
2. **Sanitize IP Addresses**: Use RFC 5737 documentation ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) for WAN/public examples, or standard RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
3. **Generic Hostnames & Domains**: Use standard example domains such as `example.com`, `node-1.internal`, or `cluster.local`. Never publish private internal domain names or real public DDNS records.
4. **No Plaintext Credentials**: Ensure API tokens, SSH keys, passwords, and secrets are represented by placeholders (`<API_KEY>`, `ghp_...EXAMPLE`).

---

## 📑 Registering New Pages in the Navigation

Whenever you create a new documentation page under `src/content/docs/`, register its route in [`astro.config.mjs`](astro.config.mjs) under the appropriate sidebar group:

```javascript
// astro.config.mjs
sidebar: [
  // ...
  {
    label: "Developer Tooling",
    items: [
      // Add your new page slug (relative to src/content/docs without .md extension)
      { label: "My New Tool", slug: "tools/my-new-tool" },
    ],
  },
];
```

---

## 📖 Extended Documentation

For complete style guide details, Starlight UI callout formatting, and authoring guidelines, consult the published portal guide:
👉 **[Contributing & Authoring Guide](https://bumuellp.github.io/bum-scrolling/meta/contributing/)**
