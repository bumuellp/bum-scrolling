---
title: "Console Keymaps & Localization Cheat-Sheet"
description: Terminal localization, console keyboard mapping with loadkeys, and recovery shell tips.
---

## ⌨️ Console Keyboard Layouts (`loadkeys`)

When connecting via out-of-band management tools (IPMI, Proxmox noVNC, Hetzner/HPE iLO, or emergency single-user recovery shells), keyboards often revert to the US English layout. This causes critical keys like `/`, `-`, `_`, `:`, and `y`/`z` to be swapped or misplaced.

### Immediate Console Keymap Switching

```bash
# Switch console layout immediately to German (QWERTZ)
sudo loadkeys de

# Switch console layout to US English (QWERTY)
sudo loadkeys us

# Alternative European keymaps
sudo loadkeys uk
sudo loadkeys fr
```

---

## 🌐 Persistent System Locale & Time (`localectl` & `timedatectl`)

```bash
# Check current locale, keymap, and X11 keyboard configuration
localectl status

# Set system console keymap permanently across reboots
sudo localectl set-keymap de

# List available system locales
localectl list-locales | grep -E "en_US|de_DE"

# Set system default locale to UTF-8 English
sudo localectl set-locale LANG=en_US.UTF-8

# Check and synchronize system time and timezone
timedatectl status
sudo timedatectl set-timezone Europe/Berlin
sudo timedatectl set-ntp true
```
