# Contributing to Bum Scrolling

Thank you for contributing to **Bum Scrolling**! This project serves as an **Engineering Handbook & Operational Portal** for cloud-native infrastructure, developer tooling, security, and Linux administration.

---

## 🧭 Content Framework: Diátaxis Architecture

To ensure documentation remains structured, predictable, and maintainable, every page in this repository maps to one of three primary **Diátaxis** archetypes:

| Archetype | Directory / Scope | Purpose | Template |
| :--- | :--- | :--- | :--- |
| **Reference / Cheat Sheet** | `src/content/docs/cheat-sheets/`<br>`src/content/docs/tools/` | Fast command lookups, syntax summaries, and tabular flags. Objective and concise. | [reference-cheatsheet.md](.github/page-templates/reference-cheatsheet.md) |
| **How-To / Runbook** | `src/content/docs/linux/`<br>`src/content/docs/security/` | Step-by-step procedures to achieve a specific operational outcome or mitigate incidents. | [how-to-runbook.md](.github/page-templates/how-to-runbook.md) |
| **Architecture / Explanation** | `src/content/docs/architecture/` | Design philosophy, system topologies, decision trade-offs, and ecosystem context. | [architecture-explanation.md](.github/page-templates/architecture-explanation.md) |

When contributing a new document, copy the appropriate template from [`.github/page-templates/`](.github/page-templates/) into the corresponding directory.

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
    label: 'Developer Tooling',
    items: [
      // Add your new page slug (relative to src/content/docs without .md extension)
      { label: 'My New Tool', slug: 'tools/my-new-tool' },
    ],
  },
]
```

---

## 📖 Extended Documentation

For complete style guide details, Starlight UI callout formatting, and authoring guidelines, consult the published portal guide:
👉 **[Contributing & Authoring Guide](https://bumuellp.github.io/bum-scrolling/meta/contributing/)**
