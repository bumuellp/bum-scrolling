---
title: SELinux Administration Cheat-Sheet
description: Operational guide for SELinux modes, context labeling, container volume flags, and resolving audit denials.
---

Security-Enhanced Linux (SELinux) enforces Mandatory Access Control (MAC) policies in the Linux kernel to confine system processes and container runtimes.

---

## 🚦 SELinux Modes & Configuration

```bash
# Check current operating mode (Enforcing, Permissive, or Disabled)
getenforce

# Temporarily switch to Permissive mode (logs violations without blocking)
sudo setenforce 0

# Temporarily switch to Enforcing mode
sudo setenforce 1
```

### Persistent Configuration (`/etc/selinux/config`)

To persist across reboots, edit `/etc/selinux/config`:

```ini
# Options: enforcing, permissive, disabled
SELINUX=enforcing
SELINUXTYPE=targeted
```

---

## 🏷️ File Contexts & Container Volume Labels

```bash
# View security contexts of files and processes
ls -lZ
ps -eZ | grep nginx

# Restore default SELinux context according to system policy
sudo restorecon -Rv /var/www/html

# Apply persistent custom label to a directory path
sudo semanage fcontext -a -t container_file_t "/data/storage(/.*)?"
sudo restorecon -Rv /data/storage
```

### Container Volumes (`:z` vs `:Z`)

In Podman and Docker on SELinux systems, mounted host directories must be relabeled to allow container access:

- **`-v /host/path:/container/path:z`**: Relabels volume with shared context (`container_file_t`), allowing **multiple containers** to read/write concurrently.
- **`-v /host/path:/container/path:Z`**: Relabels volume with private, unshared context (`container_file_t` with unique MLS category), accessible **only to this single container**.

---

## 🔍 Diagnosing Denials with `dmesg` & `audit.log`

When SELinux blocks an operation, the kernel emits an Access Vector Cache (AVC) denial.

### Inspecting Denial Logs

```bash
# Search kernel ring buffer for recent SELinux denials
dmesg | grep -i "avc:  denied"

# Search audit daemon logs for recent AVC denials
sudo ausearch -m avc -ts recent

# Format audit denials with human-readable explanations
sudo ausearch -m avc -ts recent | audit2why
```

---

## 🛠️ Generating Custom Policy Modules (`audit2allow` & `semodule`)

When a legitimate service or custom daemon is blocked:

```bash
# 1. Inspect proposed Type Enforcement rule without applying
sudo ausearch -m avc -ts recent | audit2allow

# 2. Compile denials into a custom policy package (.te and .pp)
sudo ausearch -m avc -ts recent | audit2allow -M my_service_policy

# 3. Inspect generated .te file to verify permitted permissions
cat my_service_policy.te

# 4. Install the compiled SELinux policy module
sudo semodule -i my_service_policy.pp

# 5. Verify installed module
semodule -l | grep my_service_policy

# Remove custom module if no longer needed
sudo semodule -r my_service_policy
```
