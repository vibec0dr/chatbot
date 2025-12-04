# Meilisearch cleanup CLI

Small TypeScript CLI that deletes stale documents from a Meilisearch index. Built to run on Node >= 24. Uses global fetch and the official `mongodb` package is included as a runtime dependency should the tool later need to connect to MongoDB for metadata.

Quick start

1. From the repo root run pnpm install (workspace aware)

2. Build the package:

```bash
pnpm -w --filter @docker-tools/meilisearch-cleanup run build
```

3. Run a dry-run:

```bash
node docker/extras/tools/meilisearch-cleanup/dist/index.js --index messages --days 30 --dryRun
```

Or use the bin after installing workspace links:

```bash
pnpm -w dlx @docker-tools/meilisearch-cleanup -- --index messages --days 30 --dryRun
```

Standalone build / CI
---------------------

This package provides `sea-config.json` to describe how the tool should be bundled and packaged into a standalone artifact for shipping in a Docker image or publishing.

Locally you can produce a single-file bundle (recommended) with esbuild:

```bash
pnpm --filter @docker-tools/meilisearch-cleanup run build
pnpm --filter @docker-tools/meilisearch-cleanup run build:bundle
# the bundle will be at docker/extras/tools/meilisearch-cleanup/build/meili-cleanup.js
```

For native binary builds you can call the native packager if installed (e.g. `pkg`):

```bash
pnpm --filter @docker-tools/meilisearch-cleanup run build:standalone
```

sea-config.json tells the CI which entry to build and where to copy the resulting artifact into the Docker image. A GitHub Actions job can read `sea-config.json` to produce native binaries for the desired platforms and then copy the resulting executable into the final image path (`/usr/local/bin/meili-cleanup` by default).

Example (CI pseudo-step):

```yaml
- name: Build standalone meili-cleanup
	run: |
		pnpm --filter @docker-tools/meilisearch-cleanup run build:bundle
		# optionally run pkg on CI runners to produce native binary for linux-x64
		# pkg ./docker/extras/tools/meilisearch-cleanup/dist/index.js --targets node24-linux-x64 --output ./build/meili-cleanup

- name: Copy to built image context
	run: |
		mkdir -p .docker/bin
		cp docker/extras/tools/meilisearch-cleanup/build/meili-cleanup.js .docker/bin/meili-cleanup

``` 

