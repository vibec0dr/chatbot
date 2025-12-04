/**
 * Creates a cached version of an asynchronous loader function.
 * * This decorator ensures that the underlying asynchronous function (loaderFn)
 * is only executed once per runtime instance, regardless of how many times
 * the returned function is called. All subsequent calls will receive the
 * cached result or wait for the initial loading promise to resolve/reject.
 *
 * @param loaderFn The original asynchronous function that loads the configuration.
 * @returns A wrapped function that returns the cached result after the first call.
 */
export function createCachedLoader<T>(
  loaderFn: () => Promise<T>
): () => Promise<T> {
  let cache: T | null = null;
  let loadingPromise: Promise<T> | null = null;

  return async () => {
    // 1. Return cached result immediately if available
    if (cache) {
      return cache;
    }

    // 2. Return existing promise if already loading
    if (loadingPromise) {
      return loadingPromise;
    }

    // 3. Start loading and store the promise
    loadingPromise = loaderFn();

    try {
      // Wait for the result and cache it
      cache = await loadingPromise;
      return cache;
    } catch (error) {
      // If loading failed, clear the promise so the next call can try again
      loadingPromise = null;
      throw error;
    }
  };
}
