import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('secret-service - smoke', async () => {
  it('runService returns default list action', async () => {
    const mod = await import('../dist/index.js');
    const res = await mod.runService(['node', 'cli', '--action', 'list']);
    assert.ok(res.ok);
    assert.equal(res.action, 'list');
  });
});
