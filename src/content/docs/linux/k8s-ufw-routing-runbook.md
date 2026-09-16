---
title: Kubernetes & K3s UFW Routing Runbook
description: Step-by-step operational runbook for configuring hardened interface-scoped forwarding for CNI bridges and whitelisting cluster ports in UFW.
sidebar:
  label: "Kubernetes UFW Routing"
  order: 65
  badge:
    text: "Runbook"
    variant: "success"
---

> 🔗 **Related**: [Cheat Sheet: UFW Firewall](./ufw-cheatsheet.md) · [Runbook: Docker UFW Remediation](./docker-ufw-runbook.md) · [Architecture: Kubernetes Host Networking & MTU](../containers/k8s-networking-explanation.md)

When running Kubernetes (K3s, RKE2, or kubeadm) on a host with UFW enabled, container traffic crosses virtual bridge interfaces (`cni0`, `flannel.1`, `calico`). A restrictive default forward policy blocks pod traffic. This runbook details how to configure interface-scoped routing rules and cluster port allowances without turning the host into an open transit router.

---

## 📋 Prerequisites & Requirements

Before starting this procedure, ensure the following conditions are met:

- [ ] Linux host (Ubuntu or Debian) with `ufw` active (`sudo ufw status`)
- [ ] Kubernetes cluster (K3s, RKE2, or kubeadm) installed
- [ ] Administrative `sudo` privileges on the host

---

## 🛡️ Step 1: Enforce Hardened Forwarding Baseline

> [!IMPORTANT]
> **Never set `DEFAULT_FORWARD_POLICY="ACCEPT"` globally**
> Weakening the global forward policy in `/etc/default/ufw` turns the server into an open router across all interfaces (including public internet adapters). Preserve the hardened default:
>
> ```ini
> # /etc/default/ufw
> DEFAULT_FORWARD_POLICY="DROP"
> ```

---

## 🚀 Step 2: Configure Interface-Scoped Forwarding

Choose between dynamic CLI rules or persistent configuration in `/etc/ufw/before.rules`:

### Option A: Dynamic CLI Routing (`ufw route`)

```bash
# Allow pod egress out physical adapter (eth0) toward the internet
sudo ufw route allow in on cni0 out on eth0
sudo ufw route allow in on flannel.1 out on eth0

# Allow established and related return traffic back into pods
sudo ufw route allow in on eth0 out on cni0
sudo ufw route allow in on eth0 out on flannel.1

# Allow intra-node pod-to-pod communication across local bridge
sudo ufw route allow in on cni0 out on cni0
sudo ufw route allow in on flannel.1 out on flannel.1
```

### Option B: Persistent Rules in `/etc/ufw/before.rules`

For production environments where rules must survive interface teardowns and rebuilds:

1. Open `/etc/ufw/before.rules`:

   ```bash
   sudo nano /etc/ufw/before.rules
   ```

2. Inside the `*filter` block, append the forwarding rules right before the final `COMMIT` directive:

   ```ini
   # Forwarding allowances for Kubernetes CNI and overlay bridges
   -A ufw-before-forward -i cni0 -j ACCEPT
   -A ufw-before-forward -o cni0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
   -A ufw-before-forward -i flannel.1 -j ACCEPT
   -A ufw-before-forward -o flannel.1 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
   ```

3. Reload UFW to apply:

   ```bash
   sudo ufw reload
   ```

---

## 🔒 Step 3: Whitelist Essential Cluster Ports

Expose only required internal services, keeping control planes off the public internet:

```bash
# Allow Flannel VXLAN overlay UDP tunnel (inter-node pod traffic)
sudo ufw allow 8472/udp

# Restrict Kubernetes API server (6443/tcp) exclusively to WireGuard or node subnet
sudo ufw allow in on wg0 to any port 6443 proto tcp
sudo ufw allow from 10.10.0.0/24 to any port 6443 proto tcp

# Allow Kubelet health and metrics endpoints strictly within cluster node CIDR
sudo ufw allow from 10.0.0.0/24 to any port 10250 proto tcp
```

---

## ✅ Verification

Verify routing and DNS resolution from inside a workload pod:

```bash
# Launch disposable test pod
kubectl run net-test --rm -it --image=busybox -- sh

# Inside pod: verify DNS and external egress
nslookup github.com
wget -qO- --timeout=5 https://ifconfig.me
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: UFW Firewall](./ufw-cheatsheet.md)
- [Runbook: Docker UFW Remediation](./docker-ufw-runbook.md)
- [Architecture: Kubernetes Host Networking & MTU](../containers/k8s-networking-explanation.md)
- [Runbook: WireGuard Routing & Hardening](./wireguard-routing-runbook.md)
