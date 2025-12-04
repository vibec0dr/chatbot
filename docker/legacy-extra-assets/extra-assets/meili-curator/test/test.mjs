import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

it('runCurator smoke (dry-run)', async () => {
  // stub global fetch to return empty array
  const orig = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => [], text: async () => '[]', status: 200, statusText: 'OK' });
  try {
    const mod = await import('../dist/index.js');
    const out = await mod.runCurator({ host: 'http://fake', apiKey: '', index: 'x', days: 1, batchSize: 10, dryRun: true });
    assert.equal(out.scanned, 0);
    assert.equal(out.deleted, 0);
  } finally { globalThis.fetch = orig; }
});
