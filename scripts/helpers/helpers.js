const assert = require("assert/strict");
const { Agent } = require("http");

/**
 * Parses and validates an ISO 8601 timestamp string.
 * Throws an AssertionError if the input is missing or invalid.
 *
 * @param {unknown} input - The raw user input to validate.
 * @param {string} fieldName - The name of the CLI field (used for clearer error messages).
 * @returns {Date} The parsed Date object if valid.
 * @throws {AssertionError} If input is missing or not a valid ISO 8601 date.
 */
function parseAndValidateISODate(input, fieldName) {
  assert.ok(input, `Missing required argument: --${fieldName}`);
  assert.strictEqual(typeof input, "string", `Invalid type for --${fieldName}: expected string`);

  const date = new Date(input);
  assert.ok(
    !isNaN(date.getTime()),
    `Invalid ${fieldName}: "${input}". Must be a valid ISO 8601 timestamp.`
  );

  return date;
}

async function meiliRequest(url, method, requestBody) {
    const agent = new Agent({})
    try {
      const res = await fetch(url, options)

    } catch (error) {
        
    }
}

module.exports = { parseAndValidateISODate };
