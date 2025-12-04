#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(root, '..');
const cfgPath = path.join(pkgRoot, 'sea-config.json');

async function loadConfig() {
  const raw = await fs.readFile(cfgPath, 'utf8');
  return JSON.parse(raw);
}

async function bundle(cfg) {
  console.log('Bundling with esbuild...');
  try {
    // dynamic import of esbuild so it isn't required if not present
    const esbuild = await import('esbuild');
    const entry = path.resolve(pkgRoot, cfg.entry);
    const out = path.resolve(pkgRoot, cfg.bundle.out);
    await fs.mkdir(path.dirname(out), { recursive: true });
    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      platform: 'node',
      target: ['node24'],
      format: cfg.bundle.format === 'esm' ? 'esm' : 'cjs',
      outfile: out,
      sourcemap: false,
      external: cfg.bundle.external || []
    });
    // make executable for convenience
    await fs.chmod(out, 0o755).catch(() => {});
    console.log('Bundle written to', out);
  } catch (err) {
    console.error('Bundle failed. Make sure esbuild is installed as a devDependency in the package.');
    throw err;
  }
}

function runNative(cfg) {
  // Try to use pkg if available, otherwise fall back
  const pkgBin = (process.platform === 'win32') ? 'pkg.cmd' : 'pkg';
  const which = spawnSync('which', [pkgBin]);
  if (which.status !== 0) {
    console.warn('pkg not found on PATH. Native packaging skipped. You can still bundle with `pnpm run build:bundle`.');
    return false;
  }

  // build args
  const targets = cfg.native?.targets?.map(t => `node24-${t}`) || [];
  const outBase = path.resolve(pkgRoot, 'build', cfg.native?.binaryName || 'meili-curator');
  const input = path.resolve(pkgRoot, cfg.entry);
  console.log('Running pkg to generate native binaries for', targets.join(', '));
  const args = ['--targets', targets.join(','), '--output', outBase, input];
  const res = spawnSync(pkgBin, args, { stdio: 'inherit' });
  return res.status === 0;
}

async function main() {
  const [mode] = process.argv.slice(2);
  const cfg = await loadConfig();
  if (!mode || mode === 'bundle') {
    await bundle(cfg);
    // copy into docker path if configured
    if (cfg.docker && cfg.docker.copyFrom) {
      const copyFrom = path.resolve(pkgRoot, cfg.docker.copyFrom);
      const dockerPath = path.resolve(pkgRoot, cfg.docker.copyFrom); // same here for now
      try {
        await fs.copyFile(copyFrom, dockerPath);
        if (cfg.docker.chmod) await fs.chmod(dockerPath, 0o755).catch(() => {});
      } catch (err) {
        // ignore if copyFrom doesn't exist - bundling may create it
      }
    }
    return;
  }

  if (mode === 'native') {
    const ok = runNative(cfg);
    if (!ok) throw new Error('native packaging failed or skipped');
    return;
  }

  console.error('Unknown mode', mode);
  process.exit(2);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
