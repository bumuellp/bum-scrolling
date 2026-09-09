---
title: Kubernetes & Manifest Validation Cheat-Sheet
description: Useful kubectl commands, Kustomize workflows, and shift-left validation tools.
---

## ☸️ `kubectl` Core Commands

### Cluster & Pod Inspection

```bash
# Get pods across all namespaces with wide output (IPs, nodes)
kubectl get pods -A -o wide

# Watch pod status transitions live
kubectl get pods -n <namespace> -w

# Describe pod to inspect events, scheduling, and error causes
kubectl describe pod <pod_name> -n <namespace>

# View cluster events sorted by timestamp
kubectl get events -A --sort-by='.metadata.creationTimestamp'
```

### Logs & Interactive Debugging

```bash
# Stream logs with tail and timestamps
kubectl logs -f --tail=100 -n <namespace> <pod_name>

# Stream logs across all pods sharing a label
kubectl logs -f -l app=my-app -n <namespace> --max-log-requests=10

# Execute interactive shell inside a running container
kubectl exec -it -n <namespace> <pod_name> -c <container_name> -- /bin/bash

# Port-forward service or pod to local workstation
kubectl port-forward -n <namespace> svc/<service_name> 8080:80

# Copy file to/from a pod container
kubectl cp ./local-config.yaml <namespace>/<pod_name>:/etc/app/config.yaml
kubectl cp <namespace>/<pod_name>:/var/log/app.log ./app.log
```

### Spinning Up Ephemeral & Debug Containers

```bash
# Spin up an interactive disposable shell container and auto-remove on exit
kubectl run tmp-shell --rm -i --tty --image=ghcr.io/bumuellp/lint-tools:latest -- bash

# Quick DNS / network connectivity test from inside the cluster
kubectl run dns-test --rm -i --tty --image=busybox:latest -- nslookup my-service.<namespace>.svc.cluster.local

# Attach an ephemeral debug container to an existing running pod
kubectl debug -it <pod_name> -n <namespace> --image=busybox:latest --target=<container_name>
```

### Rollout Lifecycle & Deployments

```bash
# Watch deployment rollout status live until completed or timed out
kubectl rollout status deployment/<deployment_name> -n <namespace>

# View revision history of deployments
kubectl rollout history deployment/<deployment_name> -n <namespace>

# View details of a specific rollout revision
kubectl rollout history deployment/<deployment_name> -n <namespace> --revision=2

# Roll back to the previous deployment revision
kubectl rollout undo deployment/<deployment_name> -n <namespace>

# Trigger a zero-downtime rolling restart (e.g. after configmap or secret updates)
kubectl rollout restart deployment/<deployment_name> -n <namespace>

# Scale deployment replicas
kubectl scale deployment/<deployment_name> -n <namespace> --replicas=3
```

### Node Maintenance & Resource Inspection

```bash
# View CPU and memory usage of cluster nodes (requires metrics-server)
kubectl top nodes

# View CPU and memory usage across all pods sorted by memory consumption
kubectl top pods -A --sort-by=memory

# Cordon a node (mark as unschedulable for new pods)
kubectl cordon <node_name>

# Safely drain a node for OS upgrades/reboot
kubectl drain <node_name> --ignore-daemonsets --delete-emptydir-data --force

# Uncordon node after maintenance
kubectl uncordon <node_name>
```

---

## 🛠️ Shift-Left Manifest Validation Tools

These validation tools are bundled in `ghcr.io/bumuellp/lint-tools:latest` and executed locally via `cabumtain-hook` (`id: k8s-validate`):

### 1. Kustomize

```bash
# Render manifests locally to verify overlays and patches
kustomize build ./overlays/production
```

### 2. Kubeconform (Schema Validation)

```bash
# Validate against official Kubernetes OpenAPI schemas in strict mode
kustomize build ./overlays/production | kubeconform -strict -summary -ignore-missing-schemas
```

### 3. Kube-score (Best Practice & Security Audit)

```bash
# Audit rendered manifests for security contexts, resource limits, and probe definitions
kustomize build ./overlays/production | kube-score score -
```

---

## 🔒 Security Best Practices for Pod Manifests

- **Run as Non-Root**: `securityContext.runAsNonRoot: true`, `securityContext.runAsUser: 1000`.
- **Read-Only Root Filesystem**: `securityContext.readOnlyRootFilesystem: true`.
- **Drop Capabilities**: `securityContext.capabilities.drop: ["ALL"]`.
- **Set Explicit Probes**: Define both `livenessProbe` and `readinessProbe`.
- **Define Resources**: Always define explicit `requests` and `limits` for CPU and memory.

---

## 🌐 Networking Constraints & Host Limitations

When deploying Kubernetes clusters on bare-metal, VPS nodes, or hybrid clouds, host-level firewalls and overlay VPNs impose critical constraints:

- **Host Firewall (UFW) Packet Drops**: Enabling UFW with default forwarding policies will break pod-to-pod and pod-to-service routing across CNI bridges (`cni0`, `flannel.1`, `calico`). Consult the [UFW Firewall Guide](/bum-scrolling/linux/ufw) to configure hardened interface-scoped forwarding rules without globally setting `DEFAULT_FORWARD_POLICY="ACCEPT"`.
- **WireGuard Overlay MTU & Double Encapsulation**: Routing cluster traffic (such as Flannel/Calico VXLAN or Geneve) over a WireGuard tunnel creates double-encapsulation overhead. Failing to clamp MTU values causes packet fragmentation, dropped packets, and broken TLS handshakes. Consult the [WireGuard VPN Guide](/bum-scrolling/linux/wireguard) for correct MTU sizing ($\le 1370$ bytes) and clamp guidelines.
