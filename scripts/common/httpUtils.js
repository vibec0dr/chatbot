/**
 * Builds the options object for a fetch request.
 * Pure function: no side effects.
 *
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} method - HTTP method
 * @param {string} token - Bearer token for Authorization header
 * @param {unknown} [body] - Optional request body. Will be JSON.stringified if provided
 * @returns {RequestInit} Fetch request options
 */
function buildRequestOptions(method, token, body) {
  /** @type {RequestInit} */
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return options;
}

module.exports = { buildRequestOptions };

