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
						{ label: 'Ecosystem Overview', slug: 'architecture/ecosystem' },
						{ label: 'Container Images (bum-in-a-box)', slug: 'architecture/bum-in-a-box' },
						{ label: 'Actions Suite (lights-camera-bum-action)', slug: 'architecture/lights-camera-bum-action' },
						{ label: 'Git Hooks (cabumtain-hook)', slug: 'architecture/cabumtain-hook' },
					],
				},
				{
					label: 'Containers & Cloud Native',
					items: [
						{ label: 'OCI, Podman & Docker', slug: 'cheat-sheets/docker-ghcr' },
						{ label: 'Kubernetes', slug: 'cheat-sheets/kubernetes' },
						{ label: 'Git & Versioning', slug: 'cheat-sheets/git' },
					],
				},
				{
					label: 'Linux Administration',
					items: [
						{ label: 'SSH & Hardening', slug: 'linux/ssh' },
						{ label: 'UFW Firewall', slug: 'linux/ufw' },
						{ label: 'WireGuard VPN', slug: 'linux/wireguard' },
						{ label: 'SELinux', slug: 'linux/selinux' },
						{ label: 'User & Permissions', slug: 'linux/user-permissions' },
						{ label: 'Text Processing', slug: 'linux/text-processing' },
						{ label: 'Console & Localization', slug: 'linux/localization' },
					],
				},
				{
					label: 'Developer Tooling',
					items: [
						{ label: 'GitHub CLI (gh)', slug: 'tools/gh' },
						{ label: 'GitHub Actions CI/CD', slug: 'tools/github-actions' },
						{ label: 'Pre-Commit Framework', slug: 'tools/pre-commit' },
						{ label: 'Ansible Automation', slug: 'tools/ansible' },
						{ label: 'llama.cpp Inference', slug: 'tools/llama' },
					],
				},
				{
					label: 'Security & Remediation',
					items: [
						{ label: 'CrowdSec Defense', slug: 'security/crowdsec' },
					],
				},
				{
					label: 'Meta & Contributing',
					items: [
						{ label: 'Contributing Guide', slug: 'meta/contributing' },
					],
				},
			],
		}),
	],
});
