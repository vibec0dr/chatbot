// helpers.ts
export function createCachedLoader<T>(loader: () => T): () => T {
  let cached: T | null = null;
  return () => {
    if (cached) return cached;
    cached = loader();
    return cached;
  };
}
