.PHONY: help dev serve build push deploy status clean size canary-build canary-push canary-test canary-status promote

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
