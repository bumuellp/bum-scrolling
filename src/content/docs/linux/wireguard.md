---
title: WireGuard (wg) & VPN Cheat-Sheet
description: WireGuard CLI commands, key generation, wg-quick management, and Kubernetes MTU considerations.
---

WireGuard provides kernel-level, high-performance encrypted VPN tunneling.

---

## 🔑 Key Generation & Peer Management

```bash
# Generate private key and derive corresponding public key
wg genkey | tee privatekey | wg pubkey > publickey

# Generate optional pre-shared key (quantum-resistant symmetric layer)
wg genpsk > preshared.key

# Restrict private key permissions
chmod 600 privatekey
```

---

## 🎛️ Essential WireGuard Commands

```bash
# View active WireGuard interfaces, public keys, endpoints, and handshake times
sudo wg show

# View detailed transfer statistics for a specific interface
sudo wg show wg0

# Bring up VPN interface using wg-quick configuration (/etc/wireguard/wg0.conf)
sudo wg-quick up wg0

# Teardown VPN interface
sudo wg-quick down wg0

# Enable automatic start at system boot
sudo systemctl enable --now wg-quick@wg0

# Dynamically add or update a peer without restarting the interface
sudo wg set wg0 peer <peer_public_key> allowed-ips 10.10.0.5/32 endpoint 198.51.100.10:51820
```

---

## ☸️ WireGuard with Kubernetes: MTU & Encapsulation

When connecting Kubernetes nodes or tunneling cluster traffic across WireGuard:

1. **MTU Overhead**:
   WireGuard adds **60 bytes** (IPv4) or **80 bytes** (IPv6) of encryption encapsulation header.
   - Standard Ethernet interface MTU: `1500`
   - WireGuard MTU (`/etc/wireguard/wg0.conf`): `1420` (or `1360` on PPPoE/DSL connections).

2. **CNI Double-Encapsulation Warning**:
   If your Kubernetes cluster uses an overlay CNI (e.g., Flannel VXLAN on UDP 8472), packets are encapsulated **twice** (Flannel VXLAN inside WireGuard).
   - If CNI MTU is left at default `1450`, packets will exceed the WireGuard MTU `1420`.
   - **Symptom**: Small packets (ping, DNS) succeed, but TLS handshakes and large HTTP/API requests hang indefinitely.
   - **Fix**: Set CNI MTU to `1340` (or switch to native WireGuard routing or host-gw).

---

## 🔒 Kernel Packet Forwarding: Security Risks & Hardened Configuration

If a WireGuard peer acts as a gateway or router (routing traffic between peers or to the internet), IP forwarding must be enabled.

### ⚠️ Security Risks of Global `ip_forward = 1`

Enabling global packet forwarding indiscriminately carries major risks:

1. **Unintended Transit Routing**: Setting `net.ipv4.ip_forward = 1` converts the Linux host into an active router across **all** network interfaces. If firewall rules are flushed, reloaded, or misconfigured, untrusted external packets arriving on `eth0` can be forwarded into internal LANs, Docker bridges, or cluster subnets.
2. **IPv6 SLAAC Route Loss**: Setting `net.ipv6.conf.all.forwarding = 1` switches the Linux kernel into an IPv6 router, which by default **disables SLAAC (Stateless Address Autoconfiguration)** (`accept_ra` reverts to 0). On cloud VPS hosts (Hetzner, OVH, Linode), this can cause the host to immediately drop its default IPv6 gateway.
3. **Endpoint Nodes Don't Need Forwarding**: If a node is solely an endpoint consuming VPN services (or peer-to-peer), IP forwarding is completely unnecessary and should remain `0`.

### 🛡️ Clean & Hardened Solution

#### 1. Interface-Scoped Sysctl (Least Privilege)

Instead of globally enabling forwarding across all interfaces, enable forwarding strictly on the WireGuard interface and the designated egress interface (`eth0`), preserving IPv6 Router Advertisements:

```ini
# /etc/sysctl.d/99-wireguard.conf
# Restrict IPv4 forwarding to WireGuard and egress NIC
net.ipv4.conf.wg0.forwarding = 1
net.ipv4.conf.eth0.forwarding = 1

# Restrict IPv6 forwarding while forcing SLAAC RA acceptance on WAN
net.ipv6.conf.wg0.forwarding = 1
net.ipv6.conf.eth0.forwarding = 1
net.ipv6.conf.eth0.accept_ra = 2
```

Apply without rebooting:

```bash
sudo sysctl --system
```

#### 2. Stateful Firewall Rules via `wg-quick` Lifecycle Hooks

Keep your host firewall's default forward policy set to `DROP`, and restrict forwarding explicitly to WireGuard traffic in `/etc/wireguard/wg0.conf`:

```ini
[Interface]
Address = 10.10.0.1/24, fd00:10:10::1/64
ListenPort = 51820
PrivateKey = <server-private-key>

# Stateful NAT and restricted bidirectional forwarding hooks
PostUp = iptables -A FORWARD -i %i -o eth0 -j ACCEPT; iptables -A FORWARD -i eth0 -o %i -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -o eth0 -j ACCEPT; iptables -D FORWARD -i eth0 -o %i -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
```
