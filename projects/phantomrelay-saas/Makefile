# PhantomRelay SaaS — Makefile
# Common commands for development and CI

.PHONY: dev dev-infra dev-stop test lint build docker-build migrate seed clean

dev:
	docker compose -f docker/docker-compose.dev.yml up -d && pnpm dev

dev-infra:
	docker compose -f docker/docker-compose.dev.yml up -d

dev-stop:
	docker compose -f docker/docker-compose.dev.yml down

test:
	pnpm --filter @phantomrelay-saas/api test

lint:
	pnpm --filter @phantomrelay-saas/api exec tsc --noEmit && pnpm --filter @phantomrelay-saas/web exec astro check

build:
	pnpm build

docker-build:
	docker build -f docker/Dockerfile.api -t phantomrelay-api . && docker build -f docker/Dockerfile.web -t phantomrelay-web .

migrate:
	pnpm --filter @phantomrelay-saas/api prisma:migrate

seed:
	pnpm --filter @phantomrelay-saas/api exec ts-node prisma/seed.ts

clean:
	pnpm --filter @phantomrelay-saas/api clean
