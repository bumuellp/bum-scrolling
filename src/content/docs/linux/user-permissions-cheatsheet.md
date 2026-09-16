---
title: Users, Permissions & sudo Cheat Sheet
description: High-density command reference for Linux user management, octal and symbolic chmod, special permission flags, and safe visudo rules.
sidebar:
  label: "Users & Permissions"
  order: 20
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: SSH & Remote Access](./ssh-cheatsheet.md) · [Cheat Sheet: Text Processing](./text-processing-cheatsheet.md) · [Runbook: SELinux Remediation](./selinux-runbook.md)

This reference covers Linux user and group provisioning, permission calculation across octal and symbolic modes, special security bits (`setuid`, `setgid`, sticky bit), and syntax-checked `visudo` administration.

---

## ⚡ Quick Start & Core Commands

```bash
# Create a new user with dedicated home directory and bash shell
sudo useradd -m -s /bin/bash deployer

# Add user to supplementary groups (always use -aG to append)
sudo usermod -aG sudo,docker deployer

# Inspect user UID, primary GID, and supplementary groups
id deployer

# Grant read/write/execute to owner, read/execute to group and others
chmod 755 /usr/local/bin/deploy-service.sh

# Restrict private key to owner read-only
chmod 600 ~/.ssh/id_ed25519

# Safely edit sudoers configuration with syntax validation
sudo visudo
```

---

## 📊 Command & Permission Matrix

### Octal Permission Breakdown

Permissions sum three bit values: **Read (4)** + **Write (2)** + **Execute (1)**.

| Octal Mode | Symbolic Form | Intended Use Case                                          |
| :--------- | :------------ | :--------------------------------------------------------- |
| **`755`**  | `rwxr-xr-x`   | Executable binaries, scripts, and traversable directories. |
| **`644`**  | `rw-r--r--`   | Standard configuration files and public web assets.        |
| **`700`**  | `rwx------`   | Private directories (`~/.ssh`, GPG keyrings).              |
| **`600`**  | `rw-------`   | Sensitive credentials, private keys, environment files.    |
| **`400`**  | `r--------`   | Immutable read-only certificates and secret material.      |

### Symbolic (`chmod`) Scopes and Operators

- **Scopes**: `u` (user/owner), `g` (group), `o` (others), `a` (all users)
- **Operators**: `+` (grant), `-` (revoke), `=` (set exact)

```bash
# Grant execution rights to the file owner only
chmod u+x deploy.sh

# Revoke write and execute permissions from group and others
chmod go-wx secret.txt

# Grant read access to all users
chmod a+r manifest.json

# Add directory traversal (+X) recursively without making regular files executable
chmod -R a+rX /var/www/html
```

---

## 🛠️ Common Patterns & Workflows

### User Lifecycle Management

```bash
# Change the primary group of an existing user
sudo usermod -g developers deployer

# Lock account password (disables interactive password login)
sudo usermod -L deployer

# Unlock account password
sudo usermod -U deployer

# Delete user including home directory and mail spool
sudo userdel -r deployer

# Inspect currently active logged-in sessions
who
w
```

### Special Security Bits (Setuid, Setgid, Sticky Bit)

```bash
# Setuid (4xxx / u+s): Process executes with file OWNER privileges
sudo chmod 4755 /usr/local/bin/special-tool
sudo chmod u+s /usr/local/bin/special-tool

# Setgid (2xxx / g+s): New files created inside directory inherit directory GROUP
sudo chmod 2775 /shared/project
sudo chmod g+s /shared/project

# Sticky Bit (1xxx / +t): Only file owner or root can delete files inside directory
sudo chmod 1777 /tmp
sudo chmod +t /tmp
```

### Privilege Escalation & `visudo` Rules

Always use `visudo` to prevent locking out administrator access due to typographical errors:

```bash
# Safely edit main configuration
sudo visudo

# Safely edit dedicated drop-in file
sudo visudo -f /etc/sudoers.d/deployer
```

Common drop-in rules in `/etc/sudoers.d/`:

```text
# Allow user passwordless sudo for specific maintenance commands
deployer ALL=(ALL) NOPASSWD: /usr/local/bin/deploy.sh, /usr/bin/systemctl restart nginx

# Allow full passwordless sudo for automation accounts (use with caution)
deployer ALL=(ALL) NOPASSWD:ALL
```

Switching environments safely:

```bash
# Run command as specific service user
sudo -u postgres psql

# Open full root login shell with root environment
sudo -i

# Switch user with complete login shell environment
su - deployer
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: SSH & Remote Access](./ssh-cheatsheet.md)
- [Cheat Sheet: Text Processing](./text-processing-cheatsheet.md)
- [Runbook: SELinux Remediation](./selinux-runbook.md)
