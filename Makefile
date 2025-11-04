.PHONY: help dev build push deploy status clean size canary-build canary-push canary-status promote

IMAGE := ghcr.io/1byteword/personal-site
TAG := $(shell git rev-parse --short HEAD 2>/dev/null || echo "latest")

help:
	@echo 'Production:'
	@echo '  make dev           - Start local server'
	@echo '  make build         - Build Docker image'
	@echo '  make push          - Push to registry'
	@echo '  make deploy        - Deploy to K8s'
	@echo '  make status        - Check deployment'
	@echo '  make size          - Show bundle size'
	@echo '  make clean         - Remove images'
	@echo ''
	@echo 'Canary (preview.azhankhan.com):'
	@echo '  make canary-build  - Build canary image'
	@echo '  make canary-push   - Push canary to registry'
	@echo '  make canary-status - Check canary deployment'
	@echo '  make promote       - Promote canary to production'

dev:
	@python3 -m http.server 8000

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
