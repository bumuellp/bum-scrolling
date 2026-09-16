---
title: Ansible & Automation Cheat Sheet
description: High-density command reference for Ansible ad-hoc modules, playbook dry-runs, tagging, Ansible Vault encryption, and inventory inspection.
sidebar:
  label: "Ansible Automation"
  order: 60
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: SSH & Remote Access](../linux/ssh-cheatsheet.md) · [Cheat Sheet: Users, Permissions & sudo](../linux/user-permissions-cheatsheet.md) · [Cheat Sheet: Pre-Commit Framework](./pre-commit-cheatsheet.md)

Ansible provides agentless configuration management and deployment automation. For modular playbooks, roles, and collections, refer to the [bumuellp/bumsible](https://github.com/bumuellp/bumsible) repository.

---

## ⚡ Quick Start & Core Commands

```bash
# Verify SSH connectivity across all inventory hosts
ansible all -i inventory.ini -m ping

# Dry-run playbook execution with unified diff output
ansible-playbook site.yml -i inventory.ini --check --diff

# Run playbook strictly against a specific target host
ansible-playbook site.yml -i inventory.ini --limit k8s-master

# Encrypt sensitive variable file with Ansible Vault
ansible-vault encrypt vars/secrets.yml

# Execute playbook providing vault password via prompt
ansible-playbook site.yml -i inventory.ini --ask-vault-pass
```

---

## 📊 Command & Flag Matrix

| Command / Flag        | Syntax                                         | Purpose / When Useful                                           |
| :-------------------- | :--------------------------------------------- | :-------------------------------------------------------------- |
| **`-m ping`**         | `ansible all -i inv.ini -m ping`               | Verifies Python environment and SSH authentication.             |
| **`-m setup`**        | `ansible host1 -i inv.ini -m setup`            | Gathers system facts (IPs, distribution, disks, memory).        |
| **`-m command -a`**   | `ansible web -m command -a "uptime"`           | Runs command without shell evaluation on remote hosts.          |
| **`-b` (`--become`)** | `ansible all -b -m command -a "..."`           | Escalates privileges to root via sudo.                          |
| **`--syntax-check`**  | `ansible-playbook site.yml --syntax-check`     | Validates YAML syntax and task structure without running tasks. |
| **`--check --diff`**  | `ansible-playbook site.yml --check --diff`     | Simulates execution showing exact file and state diffs.         |
| **`--limit`**         | `ansible-playbook site.yml --limit host1`      | Restricts playbook to a single host or group subset.            |
| **`--tags`**          | `ansible-playbook site.yml --tags "sec"`       | Runs only tasks annotated with the specified tag.               |
| **`--skip-tags`**     | `ansible-playbook site.yml --skip-tags "slow"` | Bypasses tasks matching the tag.                                |
| **`--step`**          | `ansible-playbook site.yml --step`             | Prompts for confirmation before executing each task.            |

---

## 🛠️ Common Patterns & Workflows

### Ad-Hoc Management Commands

```bash
# Restart a service across all webservers using sudo
ansible webservers -i inventory.ini -b -m systemd -a "name=nginx state=restarted"

# Copy an emergency file to all remote nodes
ansible all -i inventory.ini -m copy -a "src=./motd dest=/etc/motd mode=0644"
```

### Ansible Vault Secrets Management

```bash
# Encrypt an existing unencrypted variables file
ansible-vault encrypt vars/secrets.yml

# View an encrypted file without decrypting it on disk
ansible-vault view vars/secrets.yml

# Edit an encrypted file inside your default $EDITOR
ansible-vault edit vars/secrets.yml

# Decrypt a file permanently
ansible-vault decrypt vars/secrets.yml

# Rekey (change vault password)
ansible-vault rekey vars/secrets.yml

# Run playbook with password stored in secure local file
ansible-playbook site.yml -i inventory.ini --vault-password-file ~/.vault_pass
```

### Inventory Inspection

```bash
# View inventory hierarchy as an indented ASCII tree graph
ansible-inventory -i inventory.ini --graph

# Output parsed inventory as structured JSON (useful for scripting)
ansible-inventory -i inventory.ini --list
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: SSH & Remote Access](../linux/ssh-cheatsheet.md)
- [Cheat Sheet: Users, Permissions & sudo](../linux/user-permissions-cheatsheet.md)
- [Cheat Sheet: Pre-Commit Framework](./pre-commit-cheatsheet.md)
