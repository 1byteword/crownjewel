# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brutalist personal website: a single HTML file with inline styles. Total size: ~2KB. Zero external dependencies. Zero build process. First paint: instant.

**Philosophy**: Every byte removed is a byte not transferred, not parsed, not executed. The fastest code is the code you don't write. Complexity is a choice.

## Architecture

### File Structure
- `index.html` - Single HTML file (~2KB) with 17 lines of minified inline CSS
- `src/posts/*.md` - Blog posts written in Markdown (manually converted to HTML)
- `nginx.conf` - Minimal nginx configuration with gzip and security headers
- `Dockerfile` - nginx:alpine-based image (~25MB) running as non-root user
- `k8s/` - Kubernetes manifests using Kustomize, configured for ArgoCD GitOps

### Deployment Strategy
- **GitOps with ArgoCD**: Changes pushed to the main branch automatically sync to Kubernetes
- **Image Registry**: Uses GitHub Container Registry (ghcr.io)
- **Kubernetes**: 2 replicas with rolling updates, minimal resource requests (10m CPU, 16Mi memory)
- **Image Tagging**: Git commit SHA for versioning (short hash)

### Performance Optimizations
- Single HTML file with inline styles (one HTTP request)
- Georgia serif font (system default, zero loading time)
- Gzip compression for HTML (~800 bytes transferred)
- No JavaScript whatsoever
- No external requests (not even fonts or analytics)
- 1-hour HTML cache with must-revalidate
- Dark mode via CSS media query (zero JS)

## Development Commands

### Local Development
```bash
make dev                    # Start local server on port 8000
# or manually:
python3 -m http.server 8000
```

### Docker Workflow
```bash
make build                  # Build Docker image (tags with git SHA + latest)
make push                   # Build and push to registry
docker run -p 8080:80 $(IMAGE)  # Run locally
```

### Kubernetes Deployment
```bash
make deploy                 # Deploy ArgoCD application
make status                 # Check pod/service/ingress status
kubectl apply -f k8s/argocd-application.yaml  # Manual ArgoCD setup
```

### Utilities
```bash
make size                   # Show file size (just index.html now)
make clean                  # Remove Docker images
wc -c index.html            # Check exact byte count
```

## Writing Blog Posts

Blog posts are stored as Markdown files in `src/posts/` and manually converted to HTML.

### Workflow
1. Create new post: `src/posts/YYYY-MM-DD-title.md`
2. Write in Markdown format (see examples in directory)
3. When ready to publish, convert to HTML manually
4. Add to `index.html` as an `<article>` block:

```html
<article>
<time>YYYY-MM-DD</time>
<h3>Post Title</h3>
<p>Your content here...</p>
</article>
```

5. Keep chronological order (newest first)

**Note**: The Markdown files are for authoring convenience. The site itself is pure HTML with no build process.

## Configuration Required for Deployment

Before deploying, update these placeholder values:

1. **Makefile** (line 3): Change `IMAGE` variable to your registry path
2. **k8s/deployment.yaml** (line 24): Update container image URL
3. **k8s/ingress.yaml**: Set your domain name
4. **k8s/argocd-application.yaml** (line 15): Update `repoURL` to your GitHub repository
5. **index.html**: Replace placeholder content (name, company, GitHub/LinkedIn URLs, email)

## Key Technical Details

### Docker Image
- Based on `nginx:1.25-alpine` for minimal size
- Runs as non-root user (nginx user, UID 101)
- Includes health check endpoint (/)
- Custom 404 page inline in Dockerfile
- Security: read-only root filesystem compatible, drops all capabilities except NET_BIND_SERVICE

### Kubernetes Resources
- **Resource requests**: 10m CPU, 16Mi memory (extremely lightweight)
- **Resource limits**: 100m CPU, 64Mi memory
- **Security context**: Non-root, drops all capabilities, seccomp profile
- **Probes**: Liveness (10s delay) and readiness (5s delay) checking root path
- **Service**: ClusterIP on port 80
- **Kustomize**: Uses v5.0.0 for manifest management

### nginx Configuration
- Access logs disabled for performance
- Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff
- Server tokens hidden
- Gzip compression level 6 for HTML
- 1-hour cache with must-revalidate for HTML (allows updates)

## Customization Guide

- **Content**: Edit directly in `index.html` (it's all there)
- **Styling**: Modify the inline `<style>` block (lines 8-17)
- **Colors**: Edit the dark mode media query for theme changes
- **Blog posts**: Add/remove `<article>` blocks in the blog section
- **Layout**: Change font family, max-width, margins in the CSS

## Design Constraints

When making changes, maintain these principles:
- Keep total file size under 3KB (currently ~2KB)
- No external dependencies (no CSS files, no JS files, no fonts)
- No build step (pure HTML that opens directly in browser)
- Single file architecture (everything inline)
- Test final size: `wc -c index.html`
- Minify inline CSS if adding new styles
