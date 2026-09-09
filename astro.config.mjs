import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://bumuellp.github.io',
	base: '/bum-scrolling',
	integrations: [
		starlight({
			title: 'Bum Scrolling',
			description: 'Homelab Architecture, Repository Catalog, and Engineering Cheat-Sheets',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/bumuellp/bum-scrolling',
				},
			],
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Overview', slug: 'index' },
					],
				},
				{
					label: 'Architecture & Ecosystem',
					items: [
						{ label: 'Ecosystem Overview', slug: 'architecture/ecosystem', badge: { text: 'Architecture', variant: 'tip' } },
						{ label: 'Container Images (bum-in-a-box)', slug: 'architecture/bum-in-a-box', badge: { text: 'Architecture', variant: 'tip' } },
						{ label: 'Actions Suite (lights-camera-bum-action)', slug: 'architecture/lights-camera-bum-action', badge: { text: 'Architecture', variant: 'tip' } },
						{ label: 'Git Hooks (cabumtain-hook)', slug: 'architecture/cabumtain-hook', badge: { text: 'Architecture', variant: 'tip' } },
					],
				},
				{
					label: 'Containers & Cloud Native',
					items: [
						{ label: 'OCI, Podman & Docker', slug: 'containers/docker-ghcr', badge: { text: 'Cheat Sheet', variant: 'note' } },
						{ label: 'Kubernetes', slug: 'containers/kubernetes', badge: { text: 'Cheat Sheet', variant: 'note' } },
					],
				},
				{
					label: 'Linux Administration',
					items: [
						{ label: 'SSH & Hardening', slug: 'linux/ssh', badge: { text: 'Runbook', variant: 'success' } },
						{ label: 'UFW Firewall', slug: 'linux/ufw', badge: { text: 'Runbook', variant: 'success' } },
						{ label: 'WireGuard VPN', slug: 'linux/wireguard', badge: { text: 'Runbook', variant: 'success' } },
						{ label: 'SELinux', slug: 'linux/selinux', badge: { text: 'Runbook', variant: 'success' } },
						{ label: 'User & Permissions', slug: 'linux/user-permissions', badge: { text: 'Cheat Sheet', variant: 'note' } },
						{ label: 'Text Processing', slug: 'linux/text-processing', badge: { text: 'Cheat Sheet', variant: 'note' } },
						{ label: 'Console & Localization', slug: 'linux/localization', badge: { text: 'Runbook', variant: 'success' } },
					],
				},
				{
					label: 'Developer Tooling',
					items: [
						{ label: 'Git & Versioning', slug: 'tools/git', badge: { text: 'Cheat Sheet', variant: 'note' } },
						{ label: 'GitHub CLI (gh)', slug: 'tools/gh', badge: { text: 'Cheat Sheet', variant: 'note' } },
						{ label: 'GitHub Actions CI/CD', slug: 'tools/github-actions', badge: { text: 'Cheat Sheet', variant: 'note' } },
						{ label: 'Pre-Commit Framework', slug: 'tools/pre-commit', badge: { text: 'Cheat Sheet', variant: 'note' } },
						{ label: 'Ansible Automation', slug: 'tools/ansible', badge: { text: 'Cheat Sheet', variant: 'note' } },
						{ label: 'llama.cpp Inference', slug: 'tools/llama', badge: { text: 'Cheat Sheet', variant: 'note' } },
					],
				},
				{
					label: 'Security & Remediation',
					items: [
						{ label: 'CrowdSec Defense', slug: 'security/crowdsec', badge: { text: 'Runbook', variant: 'success' } },
					],
				},
				{
					label: 'Meta & Contributing',
					items: [
						{ label: 'Contributing Guide', slug: 'meta/contributing', badge: { text: 'Guide', variant: 'caution' } },
					],
				},
			],
		}),
	],
});
