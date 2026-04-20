.PHONY: help dev serve build push deploy status clean size cf-purge ship canary-build canary-push canary-test canary-status promote

IMAGE := ghcr.io/1byteword/crownjewel
TAG := $(shell git rev-parse --short HEAD 2>/dev/null || echo "latest")

help:
	@echo 'Local preview:'
	@echo '  make dev           - Serve site at http://localhost:8000 (use this; file:// breaks absolute paths)'
	@echo '  make serve         - Alias for `make dev`'
	@echo ''
	@echo 'Production:'
	@echo '  make build         - Build Docker image'
	@echo '  make push          - Push to registry'
	@echo '  make deploy        - Deploy to K8s'
	@echo '  make status        - Check deployment'
	@echo '  make size          - Show bundle size'
	@echo '  make clean         - Remove images'
	@echo ''
	@echo 'Edge / Cloudflare:'
	@echo '  make cf-purge      - Purge Cloudflare cache (needs CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID)'
	@echo '  make ship          - kubectl rollout restart + cf-purge (use after `git push`)'
	@echo ''
	@echo 'Canary (preview.azhankhan.com):'
	@echo '  make canary-build  - Build canary image'
	@echo '  make canary-test   - Run canary locally on :8080'
	@echo '  make canary-push   - Push canary to registry'
	@echo '  make canary-status - Check canary deployment'
	@echo '  make promote       - Promote canary to production'

dev:
	@echo 'Serving site at http://localhost:8000  (Ctrl-C to stop)'
	@python3 -m http.server 8000

serve: dev

build:
	docker build -t $(IMAGE):$(TAG) -t $(IMAGE):latest .

push: build
	docker push $(IMAGE):$(TAG)
	docker push $(IMAGE):latest

deploy:
	kubectl apply -f k8s/argocd-application.yaml

status:
	@kubectl get pods,svc,ingress -l app=personal-site

size:
	@echo "Total:" && wc -c index.html

clean:
	docker rmi $(IMAGE):$(TAG) $(IMAGE):latest || true

# ----- Edge / Cloudflare -----------------------------------------------------
# Both targets require these env vars (don't put them in the repo):
#   CLOUDFLARE_API_TOKEN  - scoped token (Zone:Cache Purge:Purge, etc.)
#   CLOUDFLARE_ZONE_ID    - from CF dashboard sidebar of the zone
cf-purge:
	@if [ -z "$$CLOUDFLARE_API_TOKEN" ] || [ -z "$$CLOUDFLARE_ZONE_ID" ]; then \
		echo 'Error: set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID in your shell env.'; \
		echo 'Add to ~/.zshrc:'; \
		echo '  export CLOUDFLARE_API_TOKEN="cfat_..."'; \
		echo '  export CLOUDFLARE_ZONE_ID="<from CF dashboard sidebar>"'; \
		exit 1; \
	fi
	@echo '→ Purging Cloudflare cache (zone $(shell echo $$CLOUDFLARE_ZONE_ID | cut -c1-8)…)'
	@curl -fsS -X POST \
		"https://api.cloudflare.com/client/v4/zones/$$CLOUDFLARE_ZONE_ID/purge_cache" \
		-H "Authorization: Bearer $$CLOUDFLARE_API_TOKEN" \
		-H "Content-Type: application/json" \
		--data '{"purge_everything":true}' \
		| python3 -c 'import sys,json; r=json.load(sys.stdin); print("✓ purge ok" if r.get("success") else "✗ failed: "+json.dumps(r))'

# Use after `git push` once GitHub Actions has built the new :latest image
# (give it ~2-3 min). Restarts pods to pull the new image, then purges CF.
ship:
	@echo '→ Rolling out personal-site...'
	@kubectl rollout restart deployment personal-site
	@kubectl rollout status deployment personal-site --timeout=120s
	@$(MAKE) --no-print-directory cf-purge
	@echo ''
	@echo '✓ Live. Verify:'
	@echo '  curl -sI https://azhankhan.com/ | grep -iE "last-modified|cf-cache-status|age"'

# Canary deployment commands
canary-build:
	docker buildx build --platform linux/amd64 \
		-t $(IMAGE):canary \
		.

canary-test: canary-build
	@echo "Starting canary container on http://localhost:8080"
	@echo "Press Ctrl+C to stop"
	@docker rm -f personal-site-canary 2>/dev/null || true
	docker run --name personal-site-canary -p 8080:8080 $(IMAGE):canary

canary-push: canary-build
	docker push $(IMAGE):canary

canary-status:
	@kubectl get pods,svc,ingress -l app=personal-site-canary

# Promote canary to production
promote:
	@echo "Promoting canary to production..."
	docker pull $(IMAGE):canary
	docker tag $(IMAGE):canary $(IMAGE):latest
	docker tag $(IMAGE):canary $(IMAGE):$(TAG)
	docker push $(IMAGE):latest
	docker push $(IMAGE):$(TAG)
	@echo "✓ Canary promoted to production!"
	@echo "  Production pods will restart automatically"
