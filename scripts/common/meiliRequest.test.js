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
 * @param {any} response
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

  it("should return the expected response for POST /tasks", async () => {
    const taskFixture = await loadFixture("tasks.json");
    mockFetchResponse(taskFixture);

    const actual = await meiliRequest("/tasks", "POST", { name: "Test Task" });
    assert.deepStrictEqual(actual, taskFixture);
  });

  it("should throw an error if fetch returns ok: false", async () => {
    const errorResponse = { error: "Something went wrong" };
    mockFetchResponse(errorResponse, false);

    await assert.rejects(
      async () => {
        await meiliRequest("/indexes", "GET");
      },
      {
        message: /Something went wrong/,
      }
    );
  });

  it("should throw an error if fetch itself rejects", async () => {
    fetchMock = mock.method(globalThis, "fetch", async () => {
      throw new Error("Network error");
    });

    await assert.rejects(
      async () => {
        await meiliRequest("/indexes", "GET");
      },
      {
        message: /Network error/,
      }
    );
  });

  it("should call fetch with the correct URL and options", async () => {
    const expected = await loadFixture("indexes.json");
    mockFetchResponse(expected);

    await meiliRequest("/indexes", "GET");
    assert.strictEqual(fetchMock.mock.calls.length, 1);
    const [url, options] = fetchMock.mock.calls[0];
    assert.strictEqual(url, "/indexes");
    assert.strictEqual(options.method, "GET");
  });
});
