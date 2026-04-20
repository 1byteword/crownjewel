# azhankhan.com

Personal site. Two pages — a homepage with a dithered animated palm‑tree banner
(`index.html`) and a writing index (`writing.html`) — plus standalone post
pages under `posts/`.

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
├── writing.html                     # Blog index
├── posts/                           # Published post pages (HTML)
├── src/posts/                       # Post sources (Markdown)
├── img/                             # Static images
├── publish                          # Markdown → HTML publisher
├── nginx.conf                       # Cache + gzip + security headers
├── Dockerfile                       # nginx:alpine, copies *.html + posts/ + img/
├── Makefile                         # dev / build / push / canary / promote
├── k8s/                             # Deployment, service, ingress, ArgoCD app
└── .github/workflows/build.yaml     # CI build + Trivy scan
```

## Local dev

```bash
make dev                    # python http server on :8000
```

## Publish a blog post

```bash
# 1. Write src/posts/YYYY-MM-DD-slug.md
# 2. Run the publisher (creates posts/YYYY-MM-DD-slug.html and inserts an
#    entry into writing.html)
./publish src/posts/YYYY-MM-DD-slug.md
```

See [`AGENTS.md`](./AGENTS.md) for deployment, canary workflow, and the rest
of the operational detail.
