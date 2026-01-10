import { MeiliSearch } from "meilisearch";

export const checkHealth = async (): Promise<void> => {
  const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  });

  const health = await client.health();

  if (health.status === "available") {
    console.log("Meilisearch is healthy and available.");
    return;
  }

  console.error("Meilisearch is not healthy:", health.status);
};
