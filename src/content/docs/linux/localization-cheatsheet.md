---
title: Console & Localization Cheat Sheet
description: High-density command reference for emergency console keymaps, loadkeys layouts, system locale generation, and timedatectl configuration.
sidebar:
  label: "Console & Localization"
  order: 40
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: Text Processing](./text-processing-cheatsheet.md) · [Cheat Sheet: SSH & Remote Access](./ssh-cheatsheet.md) · [Runbook: SELinux Remediation](./selinux-runbook.md)

This reference covers switching keyboard mappings in out-of-band management consoles (IPMI, Proxmox noVNC, Hetzner/HPE iLO, recovery shells) and managing persistent system locales and time synchronization via `localectl` and `timedatectl`.

---

## ⚡ Quick Start & Core Commands

```bash
# Switch console layout immediately to German (QWERTZ)
sudo loadkeys de

# Switch console layout immediately to US English (QWERTY)
sudo loadkeys us

# Check system locale and keyboard configuration
localectl status

# Set system default locale to UTF-8 English
sudo localectl set-locale LANG=en_US.UTF-8

# Set timezone and activate NTP synchronization
sudo timedatectl set-timezone Europe/Berlin
sudo timedatectl set-ntp true
```

---

## 📊 Command & Tool Matrix

| Tool / Subcommand              | Syntax                               | Purpose / When Useful                                        |
| :----------------------------- | :----------------------------------- | :----------------------------------------------------------- |
| **`loadkeys de`**              | `sudo loadkeys de`                   | Instantly switches virtual console layout to German.         |
| **`loadkeys us`**              | `sudo loadkeys us`                   | Instantly switches virtual console layout to US English.     |
| **`loadkeys uk`**              | `sudo loadkeys uk`                   | Instantly switches virtual console layout to UK English.     |
| **`localectl status`**         | `localectl status`                   | Displays system locale, console keymap, and X11 layout.      |
| **`localectl set-keymap`**     | `sudo localectl set-keymap de`       | Persists console keymap across system reboots.               |
| **`localectl list-locales`**   | `localectl list-locales`             | Lists all compiled locales available on the system.          |
| **`localectl set-locale`**     | `sudo localectl set-locale LANG=...` | Sets the global `/etc/locale.conf` or `/etc/default/locale`. |
| **`timedatectl status`**       | `timedatectl status`                 | Shows local time, UTC, RTC, timezone, and NTP sync status.   |
| **`timedatectl set-timezone`** | `sudo timedatectl set-timezone <TZ>` | Updates `/etc/localtime` symlink to designated zone.         |
| **`timedatectl set-ntp`**      | `sudo timedatectl set-ntp true`      | Enables `systemd-timesyncd` network time synchronization.    |

---

## 🛠️ Common Patterns & Workflows

### Emergency Console Recovery

In out-of-band remote consoles or single-user recovery shells, the terminal defaults to US English layout. Characters such as `/`, `-`, `_`, `:`, and `y`/`z` are transposed:

```bash
# Switch to German layout on recovery console
loadkeys de

# Switch to UK layout
loadkeys uk

# Switch to French layout
loadkeys fr
```

### Persistent Locale Configuration

```bash
# Check available generated locales
localectl list-locales | grep -E "en_US|de_DE"

# Persist German keymap for all virtual console sessions
sudo localectl set-keymap de

# Set UTF-8 English as default system locale
sudo localectl set-locale LANG=en_US.UTF-8
```

### Time and Timezone Synchronization

```bash
# Verify synchronization status
timedatectl status

# Set server timezone
sudo timedatectl set-timezone Europe/Berlin

# Enforce active NTP network time synchronization
sudo timedatectl set-ntp true
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: Text Processing](./text-processing-cheatsheet.md)
- [Cheat Sheet: SSH & Remote Access](./ssh-cheatsheet.md)
- [Runbook: SELinux Remediation](./selinux-runbook.md)
