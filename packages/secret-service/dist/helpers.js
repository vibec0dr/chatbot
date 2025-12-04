// helpers.ts
export function createCachedLoader(loader) {
    let cached = null;
    return () => {
        if (cached)
            return cached;
        cached = loader();
        return cached;
    };
}
