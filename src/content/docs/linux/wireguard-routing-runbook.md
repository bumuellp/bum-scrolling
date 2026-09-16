---
title: WireGuard Routing & Mesh Hardening Runbook
description: Step-by-step operational runbook for interface-scoped IP forwarding, IPv6 SLAAC preservation, stateful NAT hooks, and isolating Kubernetes control planes over WireGuard.
sidebar:
  label: "WireGuard Mesh & Routing"
  order: 80
  badge:
    text: "Runbook"
    variant: "success"
---

> 🔗 **Related**: [Cheat Sheet: WireGuard VPN](./wireguard-cheatsheet.md) · [Architecture: Kubernetes Host Networking & MTU](../containers/k8s-networking-explanation.md) · [Runbook: Kubernetes UFW Routing](./k8s-ufw-routing-runbook.md)

When using WireGuard as a transit gateway or private control plane mesh, configuring kernel packet forwarding requires strict interface boundaries. Enabling global forwarding introduces security hazards and breaks cloud IPv6 networking. This runbook details how to configure least-privilege interface-scoped sysctl forwarding, stateful firewall hooks, correct MTU sizing, and private Kubernetes control plane isolation.

---

## 📋 Prerequisites & Requirements

Before starting this procedure, ensure the following conditions are met:

- [ ] Linux host (Debian, Ubuntu, or RHEL-based) with WireGuard and `wg-quick` installed
- [ ] Root or `sudo` administrative privileges on the host
- [ ] Primary network interface name identified (typically `eth0` or `ens3`)

---

## 🔒 Step 1: Interface-Scoped Kernel Packet Forwarding

Indiscriminately enabling global forwarding via `net.ipv4.ip_forward = 1` converts the host into an open transit router across all network interfaces (including Docker bridges, VM interfaces, and public WAN adapters).

Furthermore, setting `net.ipv6.conf.all.forwarding = 1` switches the Linux kernel into an IPv6 router, causing it to reject Stateless Address Autoconfiguration (SLAAC) Router Advertisements (`accept_ra` reverts to 0). On cloud VPS providers (such as Hetzner, OVH, and Linode), this drops the default IPv6 gateway immediately.

### Configure Least-Privilege Sysctl Settings

Restrict forwarding exclusively to the `wg0` and `eth0` interface pair, and enforce IPv6 SLAAC router advertisement acceptance:

1. Create a sysctl drop-in file:

   ```ini
   # /etc/sysctl.d/99-wireguard.conf

   # Restrict IPv4 forwarding strictly to WireGuard and egress NIC
   net.ipv4.conf.wg0.forwarding = 1
   net.ipv4.conf.eth0.forwarding = 1

   # Restrict IPv6 forwarding while forcing SLAAC Router Advertisement acceptance
   net.ipv6.conf.wg0.forwarding = 1
   net.ipv6.conf.eth0.forwarding = 1
   net.ipv6.conf.eth0.accept_ra = 2
   ```

2. Apply the configuration immediately:

   ```bash
   sudo sysctl --system
   ```

### Why Both `wg0` and `eth0` Must Have Forwarding Enabled

Linux packet routing requires forwarding flags enabled on **both** the ingress interface and egress interface:

- Outbound transit traffic arrives on `wg0` and exits onto `eth0`.
- Inbound return traffic arrives on `eth0` and exits onto `wg0`.
- Interfaces not explicitly named (such as `docker0`, secondary NICs `eth1`, and VM bridges `virbr0`) retain `forwarding = 0` and stay completely isolated.

---

## 🛡️ Step 2: Stateful Firewall Rules via `wg-quick` Lifecycle Hooks

Keep the host firewall default forward policy set to `DROP`. Add stateful Netfilter rules in `/etc/wireguard/wg0.conf` that execute automatically when the tunnel comes up:

```ini
[Interface]
Address = 10.10.0.1/24, fd00:10:10::1/64
ListenPort = 51820
PrivateKey = <server-private-key>

# Stateful NAT and restricted bidirectional forwarding hooks
PostUp = iptables -A FORWARD -i %i -o eth0 -j ACCEPT; iptables -A FORWARD -i eth0 -o %i -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -o eth0 -j ACCEPT; iptables -D FORWARD -i eth0 -o %i -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
```

---

## 📐 Step 3: Baseline Tunnel MTU Sizing

WireGuard encapsulates IP packets inside UDP datagrams, adding **60 bytes** of overhead for IPv4 or **80 bytes** for IPv6:

- On a standard physical Ethernet uplink (1500 MTU), configure `MTU = 1420` in `/etc/wireguard/wg0.conf` to accommodate IPv4 and IPv6 traffic without fragmentation.
- On PPPoE or DSL connections (1492 MTU), configure `MTU = 1360`.

> [!NOTE]
> When routing Kubernetes cluster overlays (such as Flannel VXLAN or Calico Geneve) across a WireGuard mesh, packets undergo double encapsulation. Consult [Architecture: Kubernetes Host Networking & MTU](../containers/k8s-networking-explanation.md) for MTU calculation formulas ($\le 1340$) and PMTUD troubleshooting.
>
> For binding and firewalling Kubernetes API servers (port 6443) strictly across `wg0`, refer to [Runbook: Kubernetes UFW Routing](./k8s-ufw-routing-runbook.md).

---

## ✅ Verification

1. Verify interface-scoped sysctl flags:

   ```bash
   sysctl net.ipv4.conf.wg0.forwarding net.ipv4.conf.eth0.forwarding
   ```

2. Inspect active WireGuard handshake and byte counters:

   ```bash
   sudo wg show
   ```

3. Test packet transit from an authenticated peer:

   ```bash
   # Ping peer gateway across VPN
   ping -c 3 10.10.0.1

   # Verify external internet routing via gateway
   curl --interface 10.10.0.2 https://ifconfig.me
   ```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: WireGuard VPN](./wireguard-cheatsheet.md)
- [Architecture: Kubernetes Host Networking & MTU](../containers/k8s-networking-explanation.md)
- [Runbook: Kubernetes UFW Routing](./k8s-ufw-routing-runbook.md)
- [Cheat Sheet: UFW Firewall](./ufw-cheatsheet.md)
