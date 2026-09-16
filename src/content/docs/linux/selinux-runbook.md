---
title: SELinux Administration & AVC Remediation Runbook
description: Step-by-step operational runbook for SELinux mode management, container volume labeling, Access Vector Cache (AVC) denial triage, and policy module generation.
sidebar:
  label: "SELinux Remediation"
  order: 90
  badge:
    text: "Runbook"
    variant: "success"
---

> 🔗 **Related**: [Cheat Sheet: Container Engines](../containers/container-engines-cheatsheet.md) · [Cheat Sheet: Users, Permissions & sudo](./user-permissions-cheatsheet.md) · [Cheat Sheet: SSH & Remote Access](./ssh-cheatsheet.md)

Security-Enhanced Linux (SELinux) enforces Mandatory Access Control (MAC) in the Linux kernel to confine system daemons and container runtimes. When legitimate application operations or container volume mounts are blocked, this runbook provides a disciplined procedure to diagnose denials, relabel contexts, and generate minimal policy modules without disabling enforcement.

---

## 📋 Prerequisites & Requirements

Before starting this procedure, ensure the following conditions are met:

- [ ] Linux host running SELinux (RHEL, Rocky Linux, AlmaLinux, Fedora, or Debian/Ubuntu)
- [ ] Policy analysis tools installed (`policycoreutils-python-utils` or `policycoreutils-python`)
- [ ] Root or `sudo` administrative privileges on the host

---

## 🚦 Step 1: Check and Manage Operating Modes

SELinux operates in three modes: **Enforcing** (blocks and logs violations), **Permissive** (allows actions but logs violations), and **Disabled**.

```bash
# Check current operating mode
getenforce

# Temporarily switch to Permissive mode for diagnostic troubleshooting
sudo setenforce 0

# Restore Enforcing mode
sudo setenforce 1
```

To persist mode across reboots, update `/etc/selinux/config`:

```ini
# /etc/selinux/config
SELINUX=enforcing
SELINUXTYPE=targeted
```

---

## 🏷️ Step 2: Context Labeling & Container Volumes

Processes and files carry extended security attributes (`user:role:type:level`).

### Inspecting and Restoring Contexts

```bash
# View security labels on files and directories
ls -lZ /var/www/html

# View security labels on active processes
ps -eZ | grep nginx

# Restore default filesystem contexts defined by system policy
sudo restorecon -Rv /var/www/html
```

### Persistent Custom Directory Labels

When assigning custom directories for storage:

```bash
# Register persistent file context definition for container storage
sudo semanage fcontext -a -t container_file_t "/data/storage(/.*)?"

# Apply the new context recursively
sudo restorecon -Rv /data/storage
```

### Container Volume Mount Flags (`:z` vs `:Z`)

When mounting host directories into Docker or Podman containers on SELinux systems, append context flags:

- **`-v /host/path:/container/path:z`**: Assigns a shared context (`container_file_t`). Multiple containers can read and write the volume concurrently.
- **`-v /host/path:/container/path:Z`**: Assigns a private, isolated context with a unique MLS category. Accessible **only** to that specific container instance.

---

## 🔍 Step 3: Diagnosing AVC Denials

When the kernel blocks a system call, it emits an Access Vector Cache (AVC) denial event.

### Search Kernel and Audit Logs

```bash
# Inspect kernel ring buffer for immediate denials
dmesg | grep -i "avc:  denied"

# Query audit daemon logs for recent AVC denials
sudo ausearch -m avc -ts recent

# Pipe denials into audit2why for plain-English explanations and recommendations
sudo ausearch -m avc -ts recent | audit2why
```

`audit2why` will indicate whether the block can be resolved by a boolean toggle, context relabeling (`restorecon`), or a custom policy module.

---

## 🛠️ Step 4: Generating and Installing Custom Policy Modules

If an application requires access not permitted by targeted policy and no boolean exists:

### 1. Inspect Proposed Allow Rules

```bash
sudo ausearch -m avc -ts recent | audit2allow
```

### 2. Compile Denials into a Policy Package

Generate both the human-readable Type Enforcement file (`.te`) and the compiled binary package (`.pp`):

```bash
sudo ausearch -m avc -ts recent | audit2allow -M my_custom_service
```

### 3. Review Generated Type Enforcement Rules

Always review the generated `.te` file before installing to confirm it does not grant excessive privileges:

```bash
cat my_custom_service.te
```

### 4. Install the Compiled Policy Module

```bash
sudo semodule -i my_custom_service.pp
```

---

## ✅ Verification

1. Confirm the module is loaded into the kernel:

   ```bash
   semodule -l | grep my_custom_service
   ```

2. Verify that the target service now executes successfully without triggering new AVC denials:

   ```bash
   sudo ausearch -m avc -ts recent
   ```

3. If the module is no longer required, remove it cleanly:

   ```bash
   sudo semodule -r my_custom_service
   ```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: Container Engines](../containers/container-engines-cheatsheet.md)
- [Cheat Sheet: Users, Permissions & sudo](./user-permissions-cheatsheet.md)
- [Cheat Sheet: SSH & Remote Access](./ssh-cheatsheet.md)
- [Runbook: Docker UFW Routing](./docker-ufw-runbook.md)
