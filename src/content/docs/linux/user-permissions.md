---
title: Users, Permissions & sudo Cheat-Sheet
description: Linux user management, octal/symbolic chmod, special permission flags, and visudo best practices.
---

## 👤 User & Group Management

```bash
# Create a new user with home directory and bash shell
sudo useradd -m -s /bin/bash deployer

# Add user to supplementary groups (CRITICAL: always use -aG to append without overwriting existing groups!)
sudo usermod -aG sudo,docker deployer

# Change primary group of a user
sudo usermod -g developers deployer

# Lock / disable a user account
sudo usermod -L deployer

# Unlock a user account
sudo usermod -U deployer

# Delete a user and remove their home directory and mail spool
sudo userdel -r deployer

# Inspect user UID, GID, and active group memberships
id deployer
groups deployer

# View currently logged in users
who
w
users
```

---

## 🔒 File Permissions (`chmod`)

Permissions apply across three scopes: **User (Owner)**, **Group**, and **Others**.

### 1. Octal Notation

Permissions are calculated by summing values: **Read (4)** + **Write (2)** + **Execute (1)**.

|   Octal   | Permission  | Usage                                                   |
| :-------: | :---------- | :------------------------------------------------------ |
| **`755`** | `rwxr-xr-x` | Standard for executable scripts and directories.        |
| **`644`** | `rw-r--r--` | Standard for normal files (configuration, source code). |
| **`700`** | `rwx------` | Private directories (`~/.ssh`, GPG keyrings).           |
| **`600`** | `rw-------` | Private key files (`~/.ssh/id_ed25519`, passwords).     |
| **`400`** | `r--------` | Read-only sensitive files.                              |

```bash
chmod 755 /usr/local/bin/deploy-service.sh
chmod 600 ~/.ssh/id_ed25519
chmod 700 ~/.ssh
```

### 2. Symbolic (ASCII) Notation

- **Scopes**: `u` (user), `g` (group), `o` (other), `a` (all)
- **Operators**: `+` (add), `-` (remove), `=` (exact)

```bash
# Add executable permission for user only
chmod u+x script.sh

# Remove write and execute permissions from group and others
chmod go-wx private.txt

# Grant read permission to everyone
chmod a+r public-document.pdf

# Add execute permission to directories only (capital X) without making files executable
chmod -R a+rX /var/www/html
```

---

## 🏷️ Special Permissions (Setuid, Setgid, Sticky Bit)

```bash
# Setuid (4xxx / u+s): Process executes with file OWNER privileges (e.g. /usr/bin/passwd)
sudo chmod 4755 /usr/local/bin/special-tool
sudo chmod u+s /usr/local/bin/special-tool

# Setgid (2xxx / g+s): Files created inside directory inherit the directory's GROUP
sudo chmod 2775 /shared/project
sudo chmod g+s /shared/project

# Sticky Bit (1xxx / +t): Only file owner or root can delete files inside (standard on /tmp)
sudo chmod 1777 /tmp
sudo chmod +t /tmp
```

---

## 🛡️ `su`, `sudo` & `visudo` Best Practices

```bash
# Run command with elevated privileges
sudo apt update

# Run command as a specific service user
sudo -u postgres psql

# Open full root login shell with root's environment
sudo -i

# Switch user with complete environment (su -)
su - deployer
```

### Editing Sudoers Safely with `visudo`

> [!IMPORTANT]
> **Never edit `/etc/sudoers` directly with a normal text editor!**
> A syntax error in `/etc/sudoers` can permanently lock you out of root privileges. Always use `visudo`, which validates syntax before saving.

```bash
# Safely edit main sudoers configuration
sudo visudo

# Safely edit a modular drop-in file in /etc/sudoers.d/
sudo visudo -f /etc/sudoers.d/deployer
```

### Common `/etc/sudoers.d/` Rules

```text
# Grant deployer user passwordless sudo for specific scripts only:
deployer ALL=(ALL) NOPASSWD: /usr/local/bin/deploy.sh, /usr/bin/systemctl restart nginx

# Grant a user full passwordless sudo (use with caution):
deployer ALL=(ALL) NOPASSWD:ALL
```
