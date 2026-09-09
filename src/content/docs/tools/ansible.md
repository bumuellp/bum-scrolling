---
title: Ansible & Automation Cheat-Sheet
description: Useful Ansible CLI commands, playbook execution, Vault management, and inventory syntax.
---

Ansible provides agentless configuration management and deployment automation. For modular playbooks, roles, and collections, check out the public [**`bumuellp/bumsible`**](https://github.com/bumuellp/bumsible) collection.

---

## ⚡ Ad-Hoc Commands

```bash
# Ping all hosts in inventory to verify connectivity and SSH keys
ansible all -i inventory.ini -m ping

# Gather system facts (IPs, distribution, disks, memory) for a specific host
ansible host1 -i inventory.ini -m setup

# Execute arbitrary shell command across all web servers
ansible webservers -i inventory.ini -m command -a "uptime"

# Run command requiring root privileges via sudo (--become / -b)
ansible all -i inventory.ini -b -m command -a "systemctl status ssh"
```

---

## 📖 Playbook Execution & Testing

```bash
# Syntax check playbook without executing any tasks
ansible-playbook site.yml -i inventory.ini --syntax-check

# Dry-run with diff output (shows what files and settings would change without applying)
ansible-playbook site.yml -i inventory.ini --check --diff

# Run playbook targeting a specific host or group
ansible-playbook site.yml -i inventory.ini --limit k8s-master

# Run only tasks tagged with 'security' or 'firewall'
ansible-playbook site.yml -i inventory.ini --tags "security,firewall"

# Skip tasks tagged with 'slow'
ansible-playbook site.yml -i inventory.ini --skip-tags "slow"

# Step-by-step interactive execution (prompts before each task)
ansible-playbook site.yml -i inventory.ini --step
```

---

## 🔐 Ansible Vault (Secrets Management)

```bash
# Encrypt an existing unencrypted variables file
ansible-vault encrypt vars/secrets.yml

# View an encrypted file without decrypting it on disk
ansible-vault view vars/secrets.yml

# Edit an encrypted file in your default $EDITOR
ansible-vault edit vars/secrets.yml

# Decrypt a file permanently
ansible-vault decrypt vars/secrets.yml

# Rekey (change vault password)
ansible-vault rekey vars/secrets.yml

# Execute playbook passing vault password prompt or file
ansible-playbook site.yml -i inventory.ini --ask-vault-pass
ansible-playbook site.yml -i inventory.ini --vault-password-file ~/.vault_pass
```

---

## 📋 Inventory Inspection

```bash
# View inventory hierarchy as a visual tree graph
ansible-inventory -i inventory.ini --graph

# Output parsed inventory as structured JSON
ansible-inventory -i inventory.ini --list
```
