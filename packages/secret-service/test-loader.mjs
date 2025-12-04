// Minimal TypeScript test loader - only requires typescript (already a devDep)
// Usage: node --import ./test-loader.mjs --test src/**/*.test.ts

import { transpileModule, ModuleKind, ScriptTarget } from 'typescript';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extname } from 'node:path';

export async function resolve(specifier, context, next) {
  // Handle imports like './aws.js' -> './aws.ts'
  if (specifier.endsWith('.js') && context.parentURL?.includes('/src/')) {
    const tsSpecifier = specifier.slice(0, -3) + '.ts';
    try {
      return next(tsSpecifier);
    } catch {
      return next(specifier);
    }
  }
  return next(specifier);
}

export async function load(url, context, next) {
  if (!url.startsWith('file://') || !url.endsWith('.ts')) {
    return next(url);
  }
  
  const path = fileURLToPath(url);
  const source = readFileSync(path, 'utf-8');
  const { outputText } = transpileModule(source, {
    compilerOptions: { 
      module: ModuleKind.ESNext, 
      target: ScriptTarget.ES2022 
    }
  });
  
  return {
    format: 'module',
    source: outputText,
  };
}
