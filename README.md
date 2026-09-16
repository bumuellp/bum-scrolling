# bum-scrolling

Public knowledge base, engineering cheat-sheets, and developer tooling documentation portal powered by **Astro Starlight**.

---

## 🌐 Live Portal

- **URL**: [https://bumuellp.github.io/bum-scrolling/](https://bumuellp.github.io/bum-scrolling/)
- **Features**:
  - Offline, client-side fast search via **Pagefind**.
  - Dynamic Mermaid.js diagram rendering.
  - Native dark/light mode toggle with system preference detection.
  - Container-agnostic cheat-sheets (Podman, Docker, Kubernetes, Git).

---

## 🛠️ Local Development

### Prerequisites

- Node.js 24+ (defined in `.node-version`)
- npm 10+

### Setup & Run

```bash
# Install dependencies
npm install

# Start local Astro development server
npm run dev
```

### Production Build

```bash
# Build static site and Pagefind search index to dist/
npm run build

# Preview the built site locally
npm run preview
```

---

## 🚀 Deployment

Automated via GitHub Actions:

- **Build & Deploy**: Reusable workflow `bumuellp/lights-camera-bum-action/.github/workflows/deploy-pages.yml` builds and deploys the artifact to GitHub Pages on every push to `main`.
- **CI & Quality Gates**: PRs and branch pushes run `bumuellp/lights-camera-bum-action/pre-commit@main`.
