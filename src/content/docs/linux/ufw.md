---
title: UFW Firewall & Container Pitfalls
description: Essential UFW commands, rule management, and critical limitations with Docker and Kubernetes.
---

UFW (Uncomplicated Firewall) is a frontend for `iptables` / `nftables` on Debian/Ubuntu systems. While straightforward for standalone hosts, it has critical architectural interactions with Docker and Kubernetes.

---

## 🎛️ Essential UFW Commands

```bash
# Enable firewall and enforce on system boot
sudo ufw enable

# Check status with rule numbers and verbose details
sudo ufw status numbered
sudo ufw status verbose

# Allow specific port and protocol
sudo ufw allow 22/tcp
sudo ufw allow 443/tcp

# Rate limit SSH (blocks brute-force attempts after 6 connections in 30s)
sudo ufw limit 22/tcp

# Allow traffic from specific subnet or IP address only
sudo ufw allow from 10.0.0.0/24 to any port 6443 proto tcp

# Delete rule by number
sudo ufw delete 3

# Reload rules without restarting firewall service
sudo ufw reload
```

---

## ⚠️ Critical Danger: Docker Bypasses UFW by Default

> [!CAUTION]
> **The Docker UFW Bypass Hazard:**
> By default, Docker manipulates host `iptables` directly by inserting rules into the `PREROUTING` and `DOCKER` chains. These chains are evaluated **before** UFW's filter rules.
>
> - If you run `docker run -p 8080:80 nginx`, port `8080` is **immediately exposed to the public internet**, even if you have `ufw default deny incoming` and never opened port 8080 in UFW!

### Solutions for Docker

1. **Bind to Localhost explicitly**:

   ```bash
   docker run -p 127.0.0.1:8080:80 nginx
   ```

2. **Use `ufw-docker`**:
   Install the standard [`chaifeng/ufw-docker`](https://github.com/chaifeng/ufw-docker) utility, which populates the `DOCKER-USER` iptables chain so UFW rules apply to container ports.
3. **Switch to Rootless Podman**:
   Rootless Podman runs in user namespaces without modifying host root iptables rules, eliminating this bypass entirely.

---

## ☸️ Kubernetes & K3s Interaction (Hardened Routing)

When running Kubernetes (K3s, RKE2, kubeadm) on a host with UFW enabled, pod networking requires packet forwarding across virtual bridge interfaces (`cni0`, `flannel.1`, `calico`).

> [!IMPORTANT]
> **Never set `DEFAULT_FORWARD_POLICY="ACCEPT"` globally**:
> Weakening the global forward policy turns the host into an open router across all interfaces (including public interfaces). Keep `/etc/default/ufw` set to the hardened default:
>
> ```ini
> DEFAULT_FORWARD_POLICY="DROP"
> ```

### Proper Hardened Forwarding Rules

Instead of opening global forwarding, define explicit, interface-scoped route rules using `ufw route` or `/etc/ufw/before.rules`:

#### Option A: Using `ufw route` (CLI Approach)

```bash
# Allow pod egress to the internet through the host physical interface (eth0)
sudo ufw route allow in on cni0 out on eth0
sudo ufw route allow in on flannel.1 out on eth0

# Allow established/related return traffic back into pods
sudo ufw route allow in on eth0 out on cni0
sudo ufw route allow in on eth0 out on flannel.1

# Allow intra-node pod-to-pod communication across virtual bridges
sudo ufw route allow in on cni0 out on cni0
sudo ufw route allow in on flannel.1 out on flannel.1
```

#### Option B: Granular `/etc/ufw/before.rules` (Persistent Rules)

Add interface-scoped forward rules in `/etc/ufw/before.rules` right before the `COMMIT` line of the `*filter` table:

```ini
# Inside /etc/ufw/before.rules (under *filter table):
# Allow forwarding for Kubernetes CNI and Flannel interfaces
-A ufw-before-forward -i cni0 -j ACCEPT
-A ufw-before-forward -o cni0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A ufw-before-forward -i flannel.1 -j ACCEPT
-A ufw-before-forward -o flannel.1 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
```

### Allow Essential Cluster Ports & Overlay Protocols

```bash
# Allow Flannel VXLAN overlay port (inter-node pod communication)
sudo ufw allow 8472/udp

# Hardened API Access: Never expose port 6443 publicly (0.0.0.0/0).
# Allow Kubernetes API server ONLY over the private WireGuard mesh (wg0) or trusted node-to-node subnet:
sudo ufw allow in on wg0 to any port 6443 proto tcp
sudo ufw allow from 10.10.0.0/24 to any port 6443 proto tcp

# Allow Kubelet metrics / health endpoints within cluster subnet
sudo ufw allow from 10.0.0.0/24 to any port 10250 proto tcp
```
