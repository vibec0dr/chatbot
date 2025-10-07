const { buildRequestOptions } = require("./httpUtils");

/**
 *
 * @param {*} endpoint
 */
async function meiliRequest(endpoint, method, body) {
  const host = process.env.MEILI_HOST || "http://localhost:7700";
  const token = process.env.MEILI_MASTER_KEY || "";
  const url = `${host}${endpoint}`;

  const options = buildRequestOptions(method, token, body);

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(``);
  }

  return await response.json();
}

module.exports = {meiliRequest}
