# AGENTS.md

Operational reference for this repo. Audience: future-you and any AI agents
helping out (Cursor, Claude, Codex). Read this before making changes; keep it
honest if you change the architecture.

## What this site is

- **Static personal site with a homepage, writing index, and post pages** behind nginx in Kubernetes.
- `index.html` — homepage. The original mixed-type masthead (italic serif
  Azhan, heavy sans Khan) sits above a fixed artwork field and two editorial
  columns. The artwork alternates every 3 seconds (flowers hold for 6 seconds) between the original
  animated halftone reaching hands, rolling THINK!, press-impression DENK!,
  downward-reveal 想!, rising سوچیے!, and rotating loops with circular THINK
  lettering, followed by the floral print with a dense field of independently swaying flower layers
  over a stationary foliage-only background. The floral raster lives in `img/flower-foliage-background.png`; foreground trumpets are clipped from `img/flower-sprigs-source.png`; peonies,
  cosmos and bellflowers use `img/flower-varieties-source.png` (keyed once in
  canvas). Large peonies have slower, smaller responses; light blooms move sooner.
  Stems and trumpet tubes render behind all flower faces; heads use a staggered
  center-based arrangement (60 heads plus nine bellflower sprigs at desktop).
  There is no Observe lettering or caption. The loop print uses live projected curves and a stippled ink pattern. Each typographic print adds its exclamation
  after 1200ms; Urdu remains connected with punctuation on the left. Canvas uses the
  hands’ green-gray paper and dark ink. Pause/Next controls allow inspection;
  animation and rotation pause offscreen/in hidden tabs. Reduced motion starts
  paused and shows completed prints on manual selection. Without JS the hands
  remain visible. No build step or new dependency.
- Homepage content uses CSS subgrid to align paired title, description and
  separator tracks. The columns stay side by side on mobile. `publish` maintains
  `--paired-entry-count`; homepage dates are omitted while writing pages keep them.
- Inline CSS custom properties expose visual values. `--art-cycle-ms` controls
  print cadence; `--flowers-cycle-ms` sets the longer floral hold, `--think-reveal-ms` controls the rolling reveal, and
  `--think-ink-coverage` controls stippling. Existing system display/sans fonts
  and page colors are retained.
- `debug/` contains local design inspection and archived visual trials.
  `dev.py` injects the inspector only for local development; production has no
  debug loader. G toggles grid, B baselines, O outlines, I the inspector panel.
  The chosen masthead/rolling-print demo is `/debug/rolling-masthead.html`.
- `writing/index.html` — blog index, served at `/writing`. Same system sans-serif,
  same aesthetic as the homepage. The `publish` script inserts entries between
  the `<!-- POST_ENTRIES_START -->` / `<!-- POST_ENTRIES_END -->` markers and
  keeps them sorted newest-first.
- `writing/<slug>.html` — standalone post pages, one per published post, served
  at `/writing/<slug>` (extensionless). Filenames are derived from the source
  markdown with the `YYYY-MM-DD-` prefix stripped.

> Historical note: an earlier iteration of this repo aimed for a single
> ~3 KB `index.html` with zero JS and no fonts. That constraint is **retired**
> as of the Bricolage Grotesque / canvas redesign. Don't reintroduce it without
> explicit intent.

## Deploy pipeline (current)

```
git push main
   │
   ├─► .github/workflows/build.yaml
   │       buildx multi-arch (amd64 + arm64)
   │       push :main-<sha>, :latest, :canary
   │       Trivy scan, upload SARIF
   │
   └─► ArgoCD watches k8s/  ──►  syncs Deployment/Service/Ingress
                                  (only when k8s/ manifests change)
```

### Known gotcha: image refresh

`k8s/deployment.yaml` references `:latest` with `imagePullPolicy: Always`.
ArgoCD only syncs when something in `k8s/` changes — pushing a new HTML edit
updates the registry tag but **does not** restart the running pods. To pick
up a new image after a content-only push, run:

```bash
kubectl rollout restart deployment personal-site
kubectl rollout status  deployment personal-site
```

The clean fix is to pin the deployment to a SHA tag and have CI bump that
tag in `k8s/kustomization.yaml` after the build. Until then, remember the
rollout-restart step.

## Make targets

```bash
make dev            # python3 dev.py 8000 (extensionless post URLs)

make build          # docker build -t ghcr.io/1byteword/crownjewel:<sha>,:latest
make push           # build + push :latest and :<sha>

make deploy         # kubectl apply -f k8s/argocd-application.yaml
make status         # kubectl get pods,svc,ingress -l app=personal-site

make canary-build   # buildx --platform linux/amd64 -t :canary
make canary-test    # run :canary locally on :8080
make canary-push    # push :canary tag
make canary-status  # kubectl get pods,svc,ingress -l app=personal-site-canary
make promote        # retag :canary → :latest + :<sha>, push both

make clean          # rmi local images
```

## Canary workflow

Two independent stacks share the same cluster:

| Env       | URL                       | Tag       | Replicas |
|-----------|---------------------------|-----------|----------|
| prod      | `azhankhan.com`           | `:latest` | 2        |
| canary    | `preview.azhankhan.com`   | `:canary` | 1        |

Typical loop:

```bash
# edit index.html / writing/index.html / writing/<slug>.html / etc.
make canary-push                       # ships preview.azhankhan.com
# review at https://preview.azhankhan.com
make promote                           # canary → latest
kubectl rollout restart deployment personal-site   # see "Known gotcha"
git add . && git commit -m "..." && git push
```

## Publishing posts

```bash
# 1. Write src/posts/YYYY-MM-DD-slug.md
#    Front matter is implicit: first H1 is the title, first paragraph is the
#    excerpt (auto-truncated at 200 chars). Date comes from the filename, or
#    pass --date YYYY-MM-DD.

# 2. Publish
./publish src/posts/YYYY-MM-DD-slug.md

# Side effects:
#   - writing/<slug>.html created (date prefix stripped from filename; URL is
#     extensionless: /writing/<slug>)
#   - <article> entry inserted into writing/index.html, sorted by <time> desc,
#     dedup-by-slug on re-publish
#   - Homepage 03/writing block re-mirrored with the N newest posts
#     (HOMEPAGE_LATEST_COUNT in publish, default 5)
#   - Any ![](image.jpg) refs auto-copied into img/ with paths rewritten
```

Supported markdown subset: `#`/`##`/`###`, `**bold**`, `*italic*`, `` `code` ``,
fenced code blocks, `[text](url)`, `![alt](image.jpg)`, `- bullet` lists.
A paragraph that is just `*italic*` becomes a `<p class="attribution">`.

## Kubernetes layout (`k8s/`)

| File                          | Purpose                                       |
|-------------------------------|-----------------------------------------------|
| `argocd-application.yaml`     | ArgoCD `Application`, watches `k8s/` on main  |
| `deployment.yaml`             | Prod Deployment (2 replicas, `:latest`)       |
| `service.yaml`                | Prod ClusterIP                                |
| `ingress.yaml`                | Prod ingress for `azhankhan.com`              |
| `canary-deployment.yaml`      | Canary Deployment (1 replica, `:canary`)      |
| `canary-service.yaml`         | Canary ClusterIP                              |
| `canary-ingress.yaml`         | Canary ingress for `preview.azhankhan.com`    |
| `cert-issuer.yaml`            | cert-manager `ClusterIssuer` (Let's Encrypt)  |
| `kustomization.yaml`          | Bundles the above for ArgoCD                  |

Resource requests are deliberately tiny (10m CPU / 16 Mi memory per replica;
limits 100m / 64 Mi). The image runs as the nginx user (UID 101) with all
caps dropped and the RuntimeDefault seccomp profile.

## nginx config (`nginx.conf`)

- `listen 8080` (so it can run as non-root)
- `try_files $uri $uri/ /index.html`
- `Cache-Control: public,must-revalidate` + `expires 1h` for HTML
- `gzip on; gzip_comp_level 6;`
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- `server_tokens off`, `access_log off`

## Cost

DigitalOcean smallest cluster (~$12/month) + domain (~$12/year) +
free Let's Encrypt certs. Negligible egress for static HTML.

## First-time deploy (reference)

1. Create GHCR token, `docker login ghcr.io -u 1byteword`.
2. Make the `crownjewel` package public on GitHub.
3. Point `azhankhan.com` and `preview.azhankhan.com` A records at the
   ingress controller external IP.
4. Ensure `cert-manager`, `nginx-ingress`, and ArgoCD are installed.
5. `make deploy` to install the ArgoCD `Application`.
6. Wait ~2–5 min for cert-manager to issue both TLS certs.

## House style

- Don't add a build step. Static HTML with inline assets only.
- Don't reintroduce the "single ~3 KB file / no JS / no fonts" doctrine
  unless explicitly resurrecting it.
- Every external dependency is a deliberate choice — currently: one nginx base image. The
  previous Bricolage font remains in `fonts/` but is no longer loaded. Don't add more without a reason.
- When editing this file, keep it honest: if you change the architecture,
  update the relevant section here.
