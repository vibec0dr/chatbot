const { describe, beforeEach, it } = require("node:test");
const { buildRequestOptions } = require("./httpUtils");
const assert = require("node:assert");

describe("buildRequestOptions", () => {
  const token = "test-token";

  it("should build options with method and headers only", () => {
    const options = buildRequestOptions("GET", token);
    assert.deepStrictEqual(options, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  });

  it("should include JSON stringified body when body is provided", () => {
    const body = { key: "value" };
    const options = buildRequestOptions("POST", token, body);

    assert.deepStrictEqual(options, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  });
});
