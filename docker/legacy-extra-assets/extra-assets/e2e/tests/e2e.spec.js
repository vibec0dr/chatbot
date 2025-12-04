import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
test.describe('extra-assets bundles runtime', () => {
    test('meili-curator bundle should run and print usage or dry-run message', async () => {
        const meili = path.resolve(__dirname, '..', '..', 'meili-curator', 'build', 'meili-curator.js');
        const res = spawnSync('node', [meili, '--index', 'test', '--days', '1', '--dryRun'], { encoding: 'utf8' });
        expect(res.stdout + res.stderr).toContain('Curating index=');
    });
    test('secret-service bundle should run and return action message', async () => {
        const ss = path.resolve(__dirname, '..', '..', 'secret-service', 'build', 'secret-service.js');
        const res = spawnSync('node', [ss, '--action', 'list'], { encoding: 'utf8' });
        expect(res.stdout + res.stderr).toContain('action=');
    });
});
