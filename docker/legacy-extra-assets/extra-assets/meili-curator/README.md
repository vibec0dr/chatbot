# meili-curator

Command-line tool for pruning stale documents from a Meilisearch index. Designed to be a small standalone CLI that can be bundled and copied into images via CI.

Build & run (local):

```bash
cd docker
pnpm --filter @image-extras/meili-curator run build
pnpm --filter @image-extras/meili-curator run build:bundle
node docker/extra-assets/meili-curator/build/meili-curator.js --index messages --days 30 --dryRun
```
