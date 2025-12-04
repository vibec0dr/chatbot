# E2E tests

This package contains Playwright tests that validate the runtime behavior of bundled tools (meilisearch-cleanup, secret-service).

Note: CI should build and bundle the tools before running these tests. Tests expect bundle files at:

- docker/extras/tools/meilisearch-cleanup/build/meili-cleanup.js
- docker/extras/tools/secret-service/build/secret-service.js

Run locally from repo root:

```bash
# build both tools
pnpm --filter @docker-tools/meilisearch-cleanup run build:bundle
pnpm --filter @docker-tools/secret-service run build:bundle

# run e2e tests
pnpm --filter @docker-tools/e2e test
```
