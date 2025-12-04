# E2E tests for extra-assets

Playwright tests that validate the runtime behavior of bundled packages under docker/extra-assets.

Run locally:

```bash
pnpm --filter @image-extras/meili-curator run build:bundle
pnpm --filter @image-extras/secret-service run build:bundle
pnpm --filter @image-extras/e2e test
```
