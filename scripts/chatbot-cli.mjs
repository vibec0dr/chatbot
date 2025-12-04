#!/usr/bin/env node

/**
 * @typedef {Object} Todo
 * @property {number} userId
 * @property {number} id
 * @property {string} title
 * @property {boolean} completed
 */


import { useTryCatch } from "./hooks/useTryCatch.mjs";
import { parseArgs } from "node:util";

// ----------------------
// Async fetch helper
// ----------------------
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  return res.json();
};

// ----------------------
// Cleanup function
// ----------------------
const cleanup = async () => {
  console.log("Cleanup done");
};

// ----------------------
// Main CLI function
// ----------------------
const main = async ({ url, verbose }) => {
  if (verbose) console.log(`Fetching JSON from: ${url}`);

  /**
   * @type {import('./hooks/useTryCatch.mjs').Result<Todo, Error>}
   */
  const { data, error } = await useTryCatch(fetchJSON(url));

  if (error) {
    console.error("Error fetching JSON:", error);
    process.exit(1);
  }

  console.log("Result:", data);
};

// ----------------------
// CLI argument parsing
// ----------------------
const args = parseArgs({
  options: {
    url: {
      type: "string",
      short: "u",
      default: "https://jsonplaceholder.typicode.com/todos/1",
    },
    verbose: { type: "boolean", short: "v", default: false },
  },
  allowPositionals: false,
});

// ----------------------
// Run CLI
// ----------------------
try {
  await main(args.values);
} catch (error) {
  console.error("Error in main:", error);
  process.exit(1);
} finally {
  try {
    await cleanup();
  } catch (error) {
    console.warn("Error during cleanup:", error);
  }
}
