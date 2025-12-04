import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// runCleanup is exported from dist/index.js (built by tsc)
const distPath = new URL('../dist/index.js', import.meta.url).pathname;

describe('meili-cleanup - smoke', async () => {
  it('runCleanup should handle empty pages and return scanned 0', async () => {
    // replace global fetch with a fake that returns an empty array
    const orig = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: true, json: async () => [], text: async () => '[]', status: 200, statusText: 'OK' });
    try {
      const mod = await import(distPath);
      const result = await mod.runCleanup({ host: 'http://fake', apiKey: '', index: 'test', days: 1, batchSize: 10, dryRun: true });
      assert.equal(result.scanned, 0);
      assert.equal(result.deleted, 0);
    } finally {
      globalThis.fetch = orig;
    }
  });
});
