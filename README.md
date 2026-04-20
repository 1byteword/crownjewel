# azhankhan.com

Personal site. A homepage with a dithered animated palm‑tree banner
(`index.html`) and a writing index at `/writing` — plus standalone posts
at `/writing/<slug>`. Source lives under `src/posts/` as Markdown.

## Stack

- **Static HTML** with inline CSS + a single inline `<script>` for the canvas
- **nginx alpine** container, ~25 MB
- **Kubernetes** on a small DigitalOcean cluster, 2 replicas
- **ArgoCD** GitOps from this repo's `main` branch (watches `k8s/`)
- **GitHub Actions** builds + pushes the image to `ghcr.io/1byteword/crownjewel`
- **cert-manager + Let's Encrypt** for SSL

## Layout

```
.
├── index.html                       # Homepage (Bricolage Grotesque + dithered canvas)
├── writing/
│   ├── index.html                   # Blog index, served at /writing
│   └── <slug>.html                  # One file per post, served at /writing/<slug>
├── src/posts/YYYY-MM-DD-slug.md     # Post sources (date prefix = sort key, not URL)
├── img/                             # Static images
├── dev.py                           # Local dev server with .html fallback (mirrors nginx)
├── publish                          # Markdown → HTML publisher
├── nginx.conf                       # Cache + gzip + security headers + legacy redirects
├── Dockerfile                       # nginx:alpine, copies site files
├── Makefile                         # dev / build / push / ship
├── k8s/                             # Deployment, service, ingress, ArgoCD app
└── .github/workflows/build.yaml     # CI build + Trivy scan
```

## Local dev

```bash
make dev                    # dev.py on :8000 -- matches prod URL routing
```

## Publish a blog post

```bash
# 1. Write src/posts/YYYY-MM-DD-slug.md (starting with a "# Title" heading)
# 2. Run the publisher. It:
#    - writes writing/<slug>.html  (served at /writing/<slug>, no .html)
#    - inserts an entry into writing/index.html (sorted by date)
#    - mirrors the N newest posts into the homepage's writing section
./publish src/posts/YYYY-MM-DD-slug.md

# 3. Ship it
git push && make ship
```

See [`AGENTS.md`](./AGENTS.md) for deployment, canary workflow, and the rest
of the operational detail.
