---
title: Kubernetes CLI Cheat Sheet
description: High-density command reference for kubectl cluster operations, pod debugging, rollouts, ephemeral containers, and node maintenance.
sidebar:
  label: "Kubernetes CLI"
  order: 40
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Runbook: Kubernetes Manifest Validation](./k8s-manifest-validation-runbook.md) · [Architecture: Kubernetes Networking & MTU](./k8s-networking-explanation.md) · [Runbook: Kubernetes UFW Routing](../linux/k8s-ufw-routing-runbook.md)

This reference covers everyday `kubectl` operations across cluster inspection, workload debugging, rolling deployments, ephemeral debug containers, and node maintenance.

---

## ⚡ Quick Start & Core Commands

```bash
# Get pods across all namespaces with node and IP information
kubectl get pods -A -o wide

# Follow logs for all pods matching a label selector
kubectl logs -f -l app=web-service -n production --max-log-requests=10

# Execute interactive shell inside a running pod container
kubectl exec -it -n production <pod_name> -c <container_name> -- /bin/sh

# Forward remote service port to local workstation
kubectl port-forward -n production svc/database 5432:5432

# Trigger a zero-downtime rolling restart of deployment pods
kubectl rollout restart deployment/<deployment_name> -n production

# Inspect real-time cluster events sorted by creation timestamp
kubectl get events -A --sort-by='.metadata.creationTimestamp'
```

---

## 📊 Command & Flag Matrix

| Command / Flag            | Syntax                                     | Purpose / When Useful                                                               |
| :------------------------ | :----------------------------------------- | :---------------------------------------------------------------------------------- |
| **`get pods -A -o wide`** | `kubectl get pods -A -o wide`              | Displays pods across all namespaces with internal IPs and host node assignments.    |
| **`logs -f -l`**          | `kubectl logs -f -l app=api -n default`    | Aggregates and streams logs from multiple pods matching a label selector.           |
| **`exec -it`**            | `kubectl exec -it <pod> -- sh`             | Opens interactive terminal session inside a running container.                      |
| **`port-forward`**        | `kubectl port-forward svc/<name> 8080:80`  | Maps a remote service or pod port to a local workstation socket.                    |
| **`rollout restart`**     | `kubectl rollout restart deploy/<name>`    | Forces rolling replacement of deployment pods to pick up updated secrets or config. |
| **`rollout undo`**        | `kubectl rollout undo deploy/<name>`       | Rolls back a deployment to its previous revision.                                   |
| **`scale`**               | `kubectl scale deploy/<name> --replicas=3` | Adjusts deployment replica count manually.                                          |
| **`drain`**               | `kubectl drain <node> --ignore-daemonsets` | Evacuates all workload pods from a node prior to reboot or maintenance.             |
| **`run --rm -it`**        | `kubectl run test --rm -i --tty ...`       | Launches a disposable test pod and deletes it immediately upon exit.                |
| **`debug -it`**           | `kubectl debug -it <pod> --image=busybox`  | Attaches an ephemeral troubleshooting container to an existing workload pod.        |

---

## 🛠️ Common Patterns & Workflows

### 1. Ephemeral Troubleshooting & Diagnostics

```bash
# Launch temporary shell container with network utilities
kubectl run tmp-shell --rm -i --tty --image=ghcr.io/bumuellp/lint-tools:latest -- bash

# Test cluster internal DNS resolution from inside the pod network
kubectl run dns-test --rm -i --tty --image=busybox:latest -- nslookup my-service.default.svc.cluster.local

# Attach troubleshooting container into target container process namespace
kubectl debug -it <pod_name> -n default --image=busybox:latest --target=<container_name>
```

### 2. Rollout Lifecycle & Rollbacks

```bash
# Watch deployment rollout status live until completed or timed out
kubectl rollout status deployment/<deployment_name> -n <namespace>

# View revision history of deployments
kubectl rollout history deployment/<deployment_name> -n <namespace>

# View details of a specific rollout revision
kubectl rollout history deployment/<deployment_name> -n <namespace> --revision=2

# Roll back to the previous deployment revision
kubectl rollout undo deployment/<deployment_name> -n <namespace>
```

### 3. Node Maintenance & Resource Inspection

```bash
# View CPU and memory usage of cluster nodes (requires metrics-server)
kubectl top nodes

# View CPU and memory usage across all pods sorted by memory consumption
kubectl top pods -A --sort-by=memory

# Mark node as unschedulable
kubectl cordon <node_name>

# Safely evacuate workload pods while preserving daemonset agents
kubectl drain <node_name> --ignore-daemonsets --delete-emptydir-data --force

# Return node to active scheduling pool after maintenance
kubectl uncordon <node_name>
```

---

## ⚠️ Gotchas & Best Practices

> [!WARNING]
> **Host Firewall (UFW) Packet Drops:**
> Enabling UFW with default forward policies blocks pod-to-pod routing across virtual bridge interfaces (`cni0`, `flannel.1`). Never use `DEFAULT_FORWARD_POLICY="ACCEPT"` globally. Apply interface-scoped route rules instead. Consult the [Kubernetes Networking & MTU Architecture](./k8s-networking-explanation.md) guide.

Network encapsulation also demands careful MTU planning:

> [!WARNING]
> **WireGuard Overlay MTU & Double Encapsulation:**
> Routing cluster traffic over a WireGuard tunnel adds encryption header overhead. Setting CNI MTU too high causes packet fragmentation and frozen TLS handshakes. Clamp CNI MTU to 1340 bytes or lower when tunneling over WireGuard.

---

## 🔗 Related Documentation & Context

- **Runbook**: [Kubernetes Manifest Validation](./k8s-manifest-validation-runbook.md): Kustomize, Kubeconform, and Kube-score shift-left pipelines.
- **Architecture**: [Kubernetes Networking & MTU](./k8s-networking-explanation.md): CNI bridge forwarding, host firewalls, and encapsulation math.
- **Runbook**: [Kubernetes UFW Routing](../linux/k8s-ufw-routing-runbook.md): Interface-scoped forwarding rules for CNI networks.
- **Runbook**: [WireGuard Routing & Hardening](../linux/wireguard-routing-runbook.md): MTU sizing, kernel forwarding, and control plane isolation.
