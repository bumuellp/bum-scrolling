import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";

export default defineConfig({
  site: "https://bumuellp.github.io",
  base: "/bum-scrolling",
  integrations: [
    mermaid(),
    starlight({
      title: "Bum Scrolling",
      description:
        "Homelab Architecture, Repository Catalog, and Engineering Cheat-Sheets",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/bumuellp/bum-scrolling",
        },
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [{ label: "Overview", slug: "index" }],
        },
        {
          label: "Architecture & Ecosystem",
          items: [{ autogenerate: { directory: "architecture" } }],
        },
        {
          label: "Containers & Cloud Native",
          items: [{ autogenerate: { directory: "containers" } }],
        },
        {
          label: "Linux Administration",
          items: [{ autogenerate: { directory: "linux" } }],
        },
        {
          label: "Developer Tooling",
          items: [{ autogenerate: { directory: "tools" } }],
        },
        {
          label: "AI & Agent Engineering",
          items: [{ autogenerate: { directory: "ai" } }],
        },
        {
          label: "Security & Remediation",
          items: [{ autogenerate: { directory: "security" } }],
        },
        {
          label: "Meta & Contributing",
          items: [
            {
              label: "Contributing Guide",
              slug: "meta/contributing",
              badge: { text: "Guide", variant: "caution" },
            },
          ],
        },
      ],
    }),
  ],
});
