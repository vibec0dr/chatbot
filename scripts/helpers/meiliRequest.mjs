const { Agent } = require("node:http");
const { setTimeout: delay } = require("node:timers/promises");

const MEILI_HOST = process.env.MEILI_HOST || "http://localhost:7700";
const MEILI_API_KEY = process.env.MEILI_MASTER_KEY || "";

/**
 * Makes an authenticated MeiliSearch request with retries, timeout, and exponential backoff.
 * Handles streaming/pagination if fetchDocuments is provided.
 *
 * @param {string} endpoint - The MeiliSearch API endpoint.
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [method="GET"]
 * @param {any} [body] - Request body for POST/PUT/PATCH.
 * @param {function(Array): Promise<void>} [onDocuments] - Callback to handle each batch of documents (streaming).
 * @param {number} [limit=1000] - Number of documents per page (for streaming).
 */
async function meiliRequest(
  endpoint,
  method = "GET",
  body,
  onDocuments,
  limit = 1000
) {
  const url = `${MEILI_HOST}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
  };
  if (MEILI_API_KEY) headers["Authorization"] = `Bearer ${MEILI_API_KEY}`;

  const timeout = 5000;
  const retries = 4;
  const backoffBase = 1000;

  const agent = new Agent({ keepAlive: true, maxSockets: 10 });

  let attempt = 0;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        agent,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text().catch(() => "<no body>");
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
      }

      if (onDocuments && method === "GET") {
        // Stream in pages for documents endpoint
        let offset = 0;
        let totalFetched = 0;
        while (true) {
          const pagedUrl = new URL(url);
          pagedUrl.searchParams.set("limit", limit.toString());
          pagedUrl.searchParams.set("offset", offset.toString());

          const pageRes = await fetch(pagedUrl.toString(), {
            method,
            headers,
            agent,
            signal: controller.signal,
          });
          const docs = await pageRes.json();

          if (!Array.isArray(docs) || docs.length === 0) break;

          await onDocuments(docs);

          totalFetched += docs.length;
          offset += docs.length;
        }

        return; // finished streaming
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      attempt++;
      const isAbort = err.name === "AbortError";
      const isLastAttempt = attempt > retries;

      if (isLastAttempt) {
        throw new Error(
          `[meiliRequest] Failed after ${attempt} attempts: ${err.message}`
        );
      }

      console.warn(
        `[meiliRequest] ${isAbort ? "Timeout" : "Error"} attempt ${attempt}: ${
          err.message
        }`
      );
      const delayMs = backoffBase * Math.pow(2, attempt - 1);
      await delay(delayMs);
    }
  }
}

module.exports = { meiliRequest };
