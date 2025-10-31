# Deployment Guide

Deploy your site to **azhankhan.com** using ArgoCD and Kubernetes.

## Prerequisites

Before deploying, ensure you have:

1. **Kubernetes cluster** (GKE, EKS, DigitalOcean, Linode, etc.)
2. **kubectl** configured to access your cluster
3. **ArgoCD** installed on your cluster
4. **nginx-ingress-controller** installed
5. **cert-manager** installed (for free Let's Encrypt SSL)
6. **Domain DNS** pointing to your cluster's ingress IP

## Step 1: Set Up GitHub Container Registry

Authenticate with GitHub Container Registry:

```bash
# Create GitHub personal access token with 'write:packages' scope
# Visit: https://github.com/settings/tokens

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u 1byteword --password-stdin
```

## Step 2: Build and Push Docker Image

```bash
# Build and push the image
make push

# Or manually:
git add .
git commit -m "Initial commit"
docker build -t ghcr.io/1byteword/personal-site:$(git rev-parse --short HEAD) .
docker push ghcr.io/1byteword/personal-site:$(git rev-parse --short HEAD)
docker tag ghcr.io/1byteword/personal-site:$(git rev-parse --short HEAD) ghcr.io/1byteword/personal-site:latest
docker push ghcr.io/1byteword/personal-site:latest
```

## Step 3: Make GitHub Package Public

After first push:

1. Visit https://github.com/1byteword?tab=packages
2. Click on "personal-site"
3. Go to "Package settings"
4. Scroll down and click "Change visibility"
5. Select "Public"

(Or set up imagePullSecrets for private images)

## Step 4: Configure DNS

Point your domain to your cluster's ingress controller IP:

```bash
# Get your ingress controller's external IP
kubectl get svc -n ingress-nginx

# Add these DNS records to azhankhan.com:
# A     azhankhan.com     -> YOUR_INGRESS_IP
# A     www.azhankhan.com -> YOUR_INGRESS_IP
```

## Step 5: Verify Prerequisites on Cluster

```bash
# Check ArgoCD is running
kubectl get pods -n argocd

# Check nginx-ingress-controller
kubectl get pods -n ingress-nginx

# Check cert-manager
kubectl get pods -n cert-manager

# Verify cert-manager cluster issuer exists
kubectl get clusterissuer letsencrypt-prod
```

If `letsencrypt-prod` doesn't exist, create it:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@azhankhan.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## Step 6: Deploy with ArgoCD

```bash
# Create the ArgoCD application
make deploy

# Or manually:
kubectl apply -f k8s/argocd-application.yaml
```

## Step 7: Monitor Deployment

```bash
# Check application status
kubectl get application -n argocd

# Check pods
make status

# Watch ArgoCD sync
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller -f

# Or use ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Visit https://localhost:8080
# Username: admin
# Password: kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

## Step 8: Verify SSL Certificate

```bash
# Check certificate status
kubectl get certificate -n default

# Check certificate details
kubectl describe certificate personal-site-tls

# Wait for cert-manager to issue certificate (may take 2-5 minutes)
```

## Step 9: Test Your Site

```bash
# Test locally first
curl -H "Host: azhankhan.com" http://YOUR_INGRESS_IP

# Once DNS propagates (5-60 minutes):
curl https://azhankhan.com

# Or visit in browser:
# https://azhankhan.com
```

## Continuous Deployment

ArgoCD is now watching your GitHub repo. To update:

```bash
# 1. Edit index.html locally
# 2. Build and push new image
make push

# 3. Commit and push to GitHub
git add .
git commit -m "Update content"
git push

# ArgoCD will automatically sync within 3 minutes
# Or trigger manually:
kubectl patch application personal-site -n argocd --type merge -p '{"spec":{"syncPolicy":{"automated":null}}}'
kubectl patch application personal-site -n argocd --type merge -p '{"spec":{"syncPolicy":{"automated":{"prune":true,"selfHeal":true}}}}'
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod -l app=personal-site
kubectl logs -l app=personal-site
```

### Image pull errors
```bash
# Make sure package is public or create imagePullSecret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=1byteword \
  --docker-password=$GITHUB_TOKEN

# Add to deployment.yaml:
# spec.template.spec.imagePullSecrets:
#   - name: ghcr-secret
```

### Certificate not issuing
```bash
kubectl describe certificate personal-site-tls
kubectl describe certificaterequest
kubectl logs -n cert-manager -l app=cert-manager
```

### DNS not resolving
```bash
# Check DNS propagation
dig azhankhan.com
nslookup azhankhan.com

# Test with local hosts file first
# Add to /etc/hosts:
# YOUR_INGRESS_IP azhankhan.com
```

## Quick Reference

```bash
# Check everything
make status

# View logs
kubectl logs -l app=personal-site -f

# Restart pods
kubectl rollout restart deployment personal-site

# Check ArgoCD sync status
kubectl get application personal-site -n argocd

# Force ArgoCD sync
argocd app sync personal-site

# Get ingress IP
kubectl get ingress personal-site
```

## Cost Estimate

- **DigitalOcean**: $12/month (smallest cluster)
- **Linode**: $10/month (1 node)
- **GKE**: ~$75/month (autopilot, minimal)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)

Total: **$10-75/month** depending on provider.

## Resources

- [ArgoCD Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- [cert-manager docs](https://cert-manager.io/docs/)
- [nginx-ingress docs](https://kubernetes.github.io/ingress-nginx/)
