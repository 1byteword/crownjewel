.PHONY: help dev build push deploy status clean size

IMAGE := ghcr.io/1byteword/personal-site
TAG := $(shell git rev-parse --short HEAD 2>/dev/null || echo "latest")

help:
	@echo 'make dev       - Start local server'
	@echo 'make build     - Build Docker image'
	@echo 'make push      - Push to registry'
	@echo 'make deploy    - Deploy to K8s'
	@echo 'make status    - Check deployment'
	@echo 'make size      - Show bundle size'
	@echo 'make clean     - Remove images'

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
