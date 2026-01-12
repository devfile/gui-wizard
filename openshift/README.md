# OpenShift Deployment

This directory contains Kubernetes/OpenShift manifests for deploying the devfile-gui-wizard application using Kustomize.

## Files

- `kustomization.yaml` - Kustomize configuration (main file)
- `deployment.yaml` - Deployment manifest
- `service.yaml` - Service manifest
- `route.yaml` - OpenShift Route manifest
- `kustomization.example.yaml` - Example with customization options

## Prerequisites

1. OpenShift CLI (`oc`) or Kubernetes CLI (`kubectl`) installed (v1.14+ for Kustomize support)
2. Access to an OpenShift cluster
3. Container image built and pushed to a registry (e.g., GitHub Container Registry)

## Quick Start

### 1. Update the image reference

Edit `kustomization.yaml` and update the image name and tag:

```yaml
images:
  - name: ghcr.io/REPLACE_WITH_YOUR_USERNAME/devfile-gui-wizard
    newName: ghcr.io/your-username/devfile-gui-wizard
    newTag: latest
```

Or use a specific commit hash:
```yaml
images:
  - name: ghcr.io/REPLACE_WITH_YOUR_USERNAME/devfile-gui-wizard
    newName: ghcr.io/your-username/devfile-gui-wizard
    newTag: abc1234
```

### 2. Set namespace (optional)

Edit `kustomization.yaml` to set your namespace:

```yaml
namespace: my-project
```

Or create/switch to a project:
```bash
oc new-project devfile-gui-wizard
oc project your-project-name
```

### 3. Deploy using Kustomize

Simply run:

```bash
kubectl apply -k openshift
```

Or with `oc`:

```bash
oc apply -k openshift
```

Kustomize will automatically:
- Apply all resources (Deployment, Service, Route)
- Set the namespace
- Apply common labels
- Replace the image name/tag
- Set replica count

### 4. Verify deployment

```bash
# Check deployment status
kubectl get deployment devfile-gui-wizard

# Check pods
kubectl get pods -l app=devfile-gui-wizard

# Check service
kubectl get service devfile-gui-wizard

# Check route (OpenShift only)
oc get route devfile-gui-wizard
```

### 5. Get the application URL

```bash
oc get route devfile-gui-wizard -o jsonpath='{.spec.host}'
```

Or view all route details:
```bash
oc describe route devfile-gui-wizard
```

## Customization

### Update replica count

Edit `kustomization.yaml`:
```yaml
replicas:
  - name: devfile-gui-wizard
    count: 3  # Change to desired number
```

### Update image tag

Edit `kustomization.yaml`:
```yaml
images:
  - name: ghcr.io/REPLACE_WITH_YOUR_USERNAME/devfile-gui-wizard
    newName: ghcr.io/your-username/devfile-gui-wizard
    newTag: v1.0.0  # or commit hash: abc1234
```

### Update namespace

Edit `kustomization.yaml`:
```yaml
namespace: my-project
```

### Preview changes before applying

```bash
kubectl kustomize openshift
```

Or to see what would be applied:
```bash
kubectl apply -k openshift --dry-run=client -o yaml
```

### Using overlays for different environments

Create environment-specific overlays:

```bash
openshift/
  base/
    kustomization.yaml
    deployment.yaml
    service.yaml
    route.yaml
  overlays/
    dev/
      kustomization.yaml
    prod/
      kustomization.yaml
```

Then deploy with:
```bash
kubectl apply -k openshift/overlays/prod
```

## Using kubectl (for standard Kubernetes)

If deploying to standard Kubernetes (not OpenShift), you'll need to:

1. Remove the Route from `kustomization.yaml`:
```yaml
resources:
  - deployment.yaml
  - service.yaml
  # - route.yaml  # Comment out or remove
```

2. Add Ingress to resources and create `ingress.yaml` if needed

## Troubleshooting

### Check pod logs

```bash
kubectl logs -l app=devfile-gui-wizard
```

### Describe resources

```bash
kubectl describe deployment devfile-gui-wizard
kubectl describe pod -l app=devfile-gui-wizard
```

### Check events

```bash
kubectl get events --sort-by='.lastTimestamp'
```

### Delete and redeploy

```bash
kubectl delete -k openshift
kubectl apply -k openshift
```

## Cleanup

To remove all resources:

```bash
kubectl delete -k openshift
```

This will delete all resources defined in the kustomization.yaml file.
