import { readFile } from "node:fs/promises";

/**
 * @template T, E
 * @typedef {{ ok: true, value: T } | { ok: false, error: E }} Result
 */

/**
 * Read a file safely
 * @param {string} path
 * @returns {Promise<Result<string, Error>>}
 */
async function readFileResult(path) {
  try {
    const contents = await readFile(path, "utf-8");
    return { ok: true, value: contents };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Parse .env content into key/value object
 * @param {string} text
 * @returns {Record<string,string>}
 */
function parseDotEnv(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const [key, ...rest] = trimmed.split("=");
    env[key] = rest.join("=").trim();
  }
  return env;
}

/**
 * Load env variables into process.env
 * @param {string} path
 * @returns {Promise<Result<void, Error>>}
 */
async function loadEnv(path) {
  const result = await readFileResult(path);
  if (!result.ok) return result;

  const parsed = parseDotEnv(result.value);
  Object.assign(process.env, parsed);

  return { ok: true, value: undefined };
}

// Usage example
(async () => {
  const result = await loadEnv(".env");
  if (!result.ok) {
    console.error("Failed to load .env:", result.error);
    process.exit(1);
  }

  console.log("Example:", process.env.HOST, process.env.PORT);
})();
