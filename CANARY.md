# Canary Deployment Workflow

Test design changes on `preview.azhankhan.com` before promoting to production.

## How It Works

You have **two independent deployments**:

| Environment | URL | Image Tag | Replicas | Purpose |
|-------------|-----|-----------|----------|---------|
| **Production** | azhankhan.com | `:latest` | 2 | Live site |
| **Canary** | preview.azhankhan.com | `:canary` | 1 | Testing |

## Quick Start

### 1. Test Design Changes

```bash
# Edit index.html with your design experiments
vim index.html

# Build and push canary
make canary-push

# Visit https://preview.azhankhan.com
# (ArgoCD auto-deploys within 3 minutes)
```

### 2. Promote to Production

When you're happy with the canary:

```bash
# Promote canary → production
make promote

# Production will auto-restart with new image
```

## Detailed Workflow

### A) Workshop New Designs (Canary)

```bash
# 1. Create a feature branch (optional but recommended)
git checkout -b design-experiment

# 2. Edit your HTML/CSS
vim index.html

# 3. Test locally first
make dev
# Visit http://localhost:8000

# 4. Build and push canary image
make canary-push

# 5. Commit (triggers ArgoCD sync)
git add index.html
git commit -m "Experiment: new color scheme"
git push origin design-experiment

# 6. Wait ~3 minutes for ArgoCD to sync, then visit:
# https://preview.azhankhan.com

# 7. Share with friends for feedback
# Send them: https://preview.azhankhan.com
```

### B) Check Canary Status

```bash
# See canary pods/service/ingress
make canary-status

# Check canary logs
kubectl logs -l app=personal-site-canary -f

# Compare with production
make status  # production
```

### C) Promote Canary to Production

```bash
# When you're happy with canary, promote it:
make promote

# This does:
# 1. Pulls ghcr.io/1byteword/personal-site:canary
# 2. Tags it as :latest and :$(git-sha)
# 3. Pushes to registry
# 4. Production pods auto-restart (within 3 min)

# Verify production updated
make status
kubectl logs -l app=personal-site -f

# Merge your feature branch
git checkout main
git merge design-experiment
git push
```

### D) Rollback Production (If Needed)

If you promoted and regret it:

```bash
# Find previous working image tag
docker images ghcr.io/1byteword/personal-site

# Re-push old version as :latest
docker pull ghcr.io/1byteword/personal-site:OLD_SHA
docker tag ghcr.io/1byteword/personal-site:OLD_SHA ghcr.io/1byteword/personal-site:latest
docker push ghcr.io/1byteword/personal-site:latest

# Production will auto-restart with old version
```

## Architecture

### Production Stack
```
azhankhan.com
    ↓
Ingress (personal-site)
    ↓
Service (personal-site)
    ↓
2x Pods (ghcr.io/1byteword/personal-site:latest)
```

### Canary Stack
```
preview.azhankhan.com
    ↓
Ingress (personal-site-canary)
    ↓
Service (personal-site-canary)
    ↓
1x Pod (ghcr.io/1byteword/personal-site:canary)
```

Both stacks are **completely independent**:
- Different DNS
- Different ingress rules
- Different services
- Different pods
- Different SSL certs (personal-site-tls vs personal-site-canary-tls)

## DNS Setup

Add this A record to enable preview subdomain:

```
Type: A
Name: preview
Value: 134.199.176.46  (same as production)
TTL: 300
```

cert-manager will automatically provision SSL for `preview.azhankhan.com`.

## Common Patterns

### Pattern 1: Rapid Iteration (No Git Commits)

```bash
# Edit → Build → Push → Test loop (no commits)
vim index.html
make canary-push

# Check preview.azhankhan.com
# Repeat until satisfied

# Once happy, commit and promote
git add index.html
git commit -m "New design"
make promote
git push
```

### Pattern 2: Multiple Design Variants

```bash
# Test variant A
vim index.html  # Design A
make canary-push
# Check preview.azhankhan.com

# Test variant B
vim index.html  # Design B
make canary-push
# Check preview.azhankhan.com

# Promote the winner
make promote
```

### Pattern 3: Collaborative Design Review

```bash
# Push canary
make canary-push

# Share with team/friends
# "Hey check out https://preview.azhankhan.com"

# Get feedback, iterate
vim index.html
make canary-push

# When consensus reached
make promote
```

## Troubleshooting

### Canary not updating?

```bash
# Check if image pushed successfully
docker images | grep canary

# Force pod restart
kubectl rollout restart deployment personal-site-canary

# Check ArgoCD sync status
kubectl get application personal-site -n argocd
```

### SSL cert not issuing for preview subdomain?

```bash
# Check certificate status
kubectl get certificate

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager

# Ensure DNS is correct
dig preview.azhankhan.com +short
# Should return: 134.199.176.46
```

### Canary and production showing same content?

```bash
# Verify different images are running
kubectl get pods personal-site-7699cfc956-9xsjm -o yaml | grep image:
kubectl get pods personal-site-canary-xxx -o yaml | grep image:

# Should show :latest vs :canary
```

## Best Practices

1. **Always test locally first** (`make dev`)
2. **Use canary for experiments**, not production
3. **Share preview link** to get feedback before promoting
4. **Commit after promoting** so Git matches production
5. **Keep canary lightweight** (1 replica is enough)

## Commands Reference

```bash
# Canary workflow
make canary-build        # Build canary image
make canary-push         # Build + push canary
make canary-status       # Check canary deployment
make promote             # Promote canary → production

# Production workflow
make build               # Build production image
make push                # Build + push production
make status              # Check production deployment

# Both
make dev                 # Local development server
make size                # Check HTML file size
```

## Example Session

```bash
$ vim index.html
# Change h1 color from black to navy

$ make canary-push
Building canary image...
Pushing to registry...
✓ Done

$ # Wait ~3 minutes, then visit https://preview.azhankhan.com
$ # Looks good!

$ make promote
Promoting canary to production...
✓ Canary promoted to production!
  Production pods will restart automatically

$ git add index.html
$ git commit -m "Update: navy blue headers"
$ git push

$ # Site is live!
```

That's it! Now you can workshop designs safely before going live.
