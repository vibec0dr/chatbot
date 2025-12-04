const { describe, it, afterEach, mock } = require("node:test");
const assert = require("node:assert");
const fs = require("fs/promises");
const path = require("path");
const { meiliRequest } = require("./meiliRequest");

/**
 * @type {ReturnType<typeof mock.method> | null}
 */
let fetchMock = null;

/**
 * Load a JSON fixture from the fixtures folder
 * @param {string} filename
 * @returns {Promise<any>}
 */
async function loadFixture(filename) {
  const filePath = path.resolve(__dirname, "../fixtures", filename);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

/**
 * Helper to mock fetch with a specific response
 * @param {unknown} response
 * @param {boolean} ok
 */
function mockFetchResponse(response, ok = true) {
  fetchMock = mock.method(globalThis, "fetch", async () => ({
    ok,
    json: async () => response,
    text: async () => JSON.stringify(response),
  }));
  return fetchMock;
}

describe("meiliRequest", () => {
  afterEach(() => {
    if (fetchMock) {
      fetchMock.mock.restore();
      fetchMock = null;
    }
  });

  it("should return the expected response for GET /indexes", async () => {
    const expectedIndexes = await loadFixture("indexes.json");
    mockFetchResponse(expectedIndexes);

    const actual = await meiliRequest("/indexes", "GET");
    assert.deepStrictEqual(actual, expectedIndexes);
  });
});
