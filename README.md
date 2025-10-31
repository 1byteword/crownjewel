# Personal Site

Ultra-minimal personal website. Single page. Zero dependencies. Fast.

## Stats

- **Total size**: ~2KB (single HTML file with inline CSS)
- **Load time**: <100ms
- **Files**: 1 (index.html)
- **Docker image**: ~25MB
- **Memory usage**: 16Mi
- **First paint**: Instant

## Structure

```
.
├── index.html              # Everything (2KB)
├── src/posts/             # Blog posts (Markdown)
├── Dockerfile             # nginx alpine
├── nginx.conf             # Minimal config
└── k8s/                   # Kubernetes + ArgoCD
```

## Local Dev

```bash
# Start server
python3 -m http.server 8000

# Or with Docker
docker build -t site .
docker run -p 8080:80 site
```

## Deploy

1. Update `k8s/deployment.yaml` with your image registry
2. Update `k8s/ingress.yaml` with your domain
3. Push to GitHub
4. Deploy with ArgoCD:

```bash
kubectl apply -f k8s/argocd-application.yaml
```

## Blog Posts

Write posts in `src/posts/` as Markdown, then manually convert to HTML:

```html
<article>
<time>2025-01-15</time>
<h3>Post Title</h3>
<p>Content here...</p>
</article>
```

## Customize

- **Content**: Edit `index.html` (everything is there)
- **Styling**: Modify inline `<style>` block
- **Links**: Update GitHub/LinkedIn/email

## Performance

- Single HTML file (one HTTP request)
- Inline CSS (17 lines, minified)
- Zero JavaScript
- System fonts (Georgia serif)
- Gzip compression (~800 bytes transferred)
- No external requests
- Dark mode via CSS media query

## Why This Works

Every byte removed is a byte not transferred, not parsed, not executed.
The fastest code is the code you don't write.

## License

Public domain - use however you want
