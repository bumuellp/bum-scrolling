---
title: WireGuard VPN Cheat Sheet
description: High-density command reference for WireGuard key generation, interface lifecycle management, and peer administration.
sidebar:
  label: "WireGuard VPN"
  order: 70
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Runbook: WireGuard Routing & Hardening](./wireguard-routing-runbook.md) · [Architecture: Kubernetes Host Networking & MTU](../containers/k8s-networking-explanation.md) · [Cheat Sheet: UFW Firewall](./ufw-cheatsheet.md)

WireGuard provides kernel-level, high-performance encrypted VPN tunneling. This reference covers cryptographic key generation, interface lifecycle commands, and dynamic peer updates.

---

## ⚡ Quick Start & Core Commands

```bash
# Generate private key and derive corresponding public key
wg genkey | tee privatekey | wg pubkey > publickey

# Generate optional pre-shared key for quantum-resistant symmetric layer
wg genpsk > preshared.key

# Secure private key permissions
chmod 600 privatekey preshared.key

# Inspect active WireGuard interfaces, handshakes, and transfer stats
sudo wg show

# Bring up VPN interface via wg-quick configuration (/etc/wireguard/wg0.conf)
sudo wg-quick up wg0

# Teardown VPN interface
sudo wg-quick down wg0

# Enable automatic start at boot
sudo systemctl enable --now wg-quick@wg0
```

---

## 📊 Command & Flag Matrix

| Command / Flag            | Syntax                            | Purpose / When Useful                                                                |
| :------------------------ | :-------------------------------- | :----------------------------------------------------------------------------------- |
| **`wg genkey`**           | `wg genkey > privatekey`          | Generates a base64-encoded Curve25519 private key.                                   |
| **`wg pubkey`**           | `wg pubkey < privatekey > pubkey` | Derives public key from corresponding private key.                                   |
| **`wg genpsk`**           | `wg genpsk > preshared.key`       | Generates 256-bit symmetric pre-shared key (PSK).                                    |
| **`wg show`**             | `sudo wg show`                    | Displays active interfaces, endpoints, allowed IPs, handshakes, and byte counters.   |
| **`wg show <dev>`**       | `sudo wg show wg0`                | Restricts diagnostic output to specified device.                                     |
| **`wg-quick up <dev>`**   | `sudo wg-quick up wg0`            | Parses `/etc/wireguard/<dev>.conf`, configures routes and addresses, brings link up. |
| **`wg-quick down <dev>`** | `sudo wg-quick down wg0`          | Deletes routes, flushes addresses, and removes virtual interface.                    |
| **`wg set peer`**         | `sudo wg set wg0 peer <key> ...`  | Modifies runtime peer parameters without restarting interface.                       |

---

## 🛠️ Common Patterns & Workflows

### Dynamic Peer Management (Zero-Downtime Updates)

Update peer definitions on a live interface without interrupting existing tunnels:

```bash
# Add or update peer with allowed subnets and remote endpoint
sudo wg set wg0 peer <peer_public_key> \
  allowed-ips 10.10.0.5/32 \
  endpoint 198.51.100.10:51820

# Remove peer from active interface
sudo wg set wg0 peer <peer_public_key> remove
```

### Typical Interface Configuration (`/etc/wireguard/wg0.conf`)

```ini
[Interface]
Address = 10.10.0.1/24
ListenPort = 51820
PrivateKey = <server-private-key>

[Peer]
PublicKey = <client-public-key>
PresharedKey = <optional-preshared-key>
AllowedIPs = 10.10.0.2/32
Endpoint = 203.0.113.50:51820
PersistentKeepalive = 25
```

---

## 🔗 Related Documentation & Context

- [Runbook: WireGuard Routing & Hardening](./wireguard-routing-runbook.md)
- [Architecture: Kubernetes Host Networking & MTU](../containers/k8s-networking-explanation.md)
- [Cheat Sheet: UFW Firewall](./ufw-cheatsheet.md)
- [Runbook: Kubernetes UFW Routing](./k8s-ufw-routing-runbook.md)
