---
title: Kubernetes Manifest Validation Runbook
description: Step-by-step procedure for rendering, schema validation, and security auditing of Kubernetes manifests using Kustomize, Kubeconform, and Kube-score.
sidebar:
  label: "Manifest Validation"
  order: 50
  badge:
    text: "Runbook"
    variant: "success"
---

> 🔗 **Related**: [Cheat Sheet: Kubernetes CLI](./kubernetes-cheatsheet.md) · [Architecture: Kubernetes Networking & MTU](./k8s-networking-explanation.md) · [Runbook: Container Image Security](./image-security-runbook.md)

Catching configuration defects and security violations locally before committing or deploying prevents runtime failures and misconfigured pods. This procedure validates Kubernetes manifests against official OpenAPI schemas and security standards using Kustomize, Kubeconform, and Kube-score.

---

## 📋 Prerequisites & Requirements

Before starting this procedure, ensure the following conditions are met:

- [ ] Kustomize v5.0+ installed (or built into `kubectl -k`)
- [ ] Kubeconform v0.6+ installed for OpenAPI schema validation
- [ ] Kube-score v1.18+ installed for security and resiliency auditing
- [ ] Optional: Docker or Podman installed to execute via container (`ghcr.io/bumuellp/lint-tools`)

| Requirement          | Purpose                                            | Minimum Recommended Version        |
| :------------------- | :------------------------------------------------- | :--------------------------------- |
| **Kustomize**        | Renders overlays, patches, and resource bundles    | v5.0+ (or built into `kubectl -k`) |
| **Kubeconform**      | High-performance OpenAPI and JSON schema validator | v0.6+                              |
| **Kube-score**       | Static security and resilience audit tool          | v1.18+                             |
| **Docker or Podman** | Optional: Run tools via container                  | v24.0+ / v4.6+                     |

All validation utilities are pre-packaged in `ghcr.io/bumuellp/lint-tools:latest` and execute locally through `cabumtain-hook` with hook ID `k8s-validate`.

---

## 🚀 Step-by-Step Procedure

### Step 1: Render Manifests with Kustomize

Always render the targeted overlay rather than evaluating raw base templates. This ensures all strategic merge patches, secret generators, and namespace transformations are applied:

```bash
# Render production overlay to stdout for initial inspection
kustomize build ./overlays/production
```

If using standard `kubectl`, run:

```bash
kubectl kustomize ./overlays/production
```

---

### Step 2: Validate Against Kubernetes OpenAPI Schemas

Pipe the rendered output into `kubeconform`. Enable strict mode to reject unknown fields or malformed properties:

```bash
kustomize build ./overlays/production | kubeconform \
  -strict \
  -summary \
  -ignore-missing-schemas \
  -kubernetes-version 1.30.0
```

Key flags:

- `-strict`: Fails if manifests contain undocumented or misspelled keys.
- `-summary`: Prints an aggregated count of valid, invalid, and skipped resources.
- `-ignore-missing-schemas`: Skips Custom Resource Definitions (CRDs) that lack standard schemas.
- `-kubernetes-version`: Pinpoints the target cluster API schema version.

---

### Step 3: Audit Security Contexts and Resilience with Kube-score

Evaluate the rendered manifests for cluster resilience, resource guarantees, and Linux container permissions:

```bash
kustomize build ./overlays/production | kube-score score -
```

Kube-score flags critical antipatterns:

- Missing CPU and memory resource requests or limits.
- Missing readiness or liveness probes.
- Running containers as the root user.
- Pods running without explicit anti-affinity rules.

---

### Step 4: Apply Hardened Pod Security Configurations

When Kube-score identifies violations, adjust the pod and container specifications to meet baseline and restricted Pod Security Standards:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hardened-app
  namespace: production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hardened-app
  template:
    metadata:
      labels:
        app: hardened-app
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        runAsGroup: 1000
        fsGroup: 1000
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: application
          image: ghcr.io/bumuellp/app:v1.2.0
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
          volumeMounts:
            - name: tmp-storage
              mountPath: /tmp
      volumes:
        - name: tmp-storage
          emptyDir: {}
```

---

## ✅ Verification

Run the entire pipeline in sequence. A clean validation returns exit code 0 across all checks:

```bash
# Full validation one-liner
kustomize build ./overlays/production | kubeconform -strict -summary -ignore-missing-schemas && \
kustomize build ./overlays/production | kube-score score -
```

If using local Git hooks via `cabumtain-hook`:

```bash
# Execute the k8s-validate hook locally across all manifests
pre-commit run k8s-validate --all-files
```

Expected output:

```text
Summary: 12 resources found in 1 file - Valid: 12, Invalid: 0, Errors: 0, Skipped: 0
[OK] hardened-app apps/v1/Deployment
[OK] hardened-app v1/Service
```

---

## 🔍 Troubleshooting & Failure Modes

### Custom Resource Definitions Triggering Schema Errors

- **Symptom**: `kubeconform` reports `could not find schema for <CRD_Kind>`.
- **Cause**: Standard Kubernetes schemas do not include vendor-specific CRDs (e.g., Cert-Manager, Traefik, ArgoCD).
- **Resolution**: Pass the Datree CRD catalog schema repository to `kubeconform`:

```bash
kustomize build ./overlays/production | kubeconform \
  -strict \
  -summary \
  -schema-location default \
  -schema-location 'https://raw.githubusercontent.com/datreeio/CRDs-catalog/main/{{.ResourceKind}}_{{.ResourceAPIVersion}}.json'
```

### Application Crashes on Read-Only Root Filesystem

- **Symptom**: Pod enters `CrashLoopBackOff` with `EROFS: read-only file system` errors when trying to write to `/tmp` or `/run`.
- **Cause**: `securityContext.readOnlyRootFilesystem: true` blocks all filesystem writes outside explicitly mounted volumes.
- **Resolution**: Mount disposable `emptyDir` volumes to paths where temporary writes are strictly necessary:

```yaml
volumeMounts:
  - name: ephemeral-tmp
    mountPath: /tmp
volumes:
  - name: ephemeral-tmp
    emptyDir:
      medium: Memory
      sizeLimit: 64Mi
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: Kubernetes CLI](./kubernetes-cheatsheet.md)
- [Architecture: Kubernetes Networking & MTU](./k8s-networking-explanation.md)
- [Runbook: Container Image Security](./image-security-runbook.md)
- [Runbook: Kubernetes UFW Routing](../linux/k8s-ufw-routing-runbook.md)
