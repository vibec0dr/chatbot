import "dotenv/config";

const hello = (msg: string) => {
  console.log(`Hello, ${msg}!`);

  console.log("Meilisearch CLI is running...");
  console.log(`Meilisearch Host: ${process.env.MEILISEARCH_HOST}`);
  console.log(`Meilisearch API Key: ${process.env.MEILISEARCH_API_KEY}`);
};

(() => {
  hello("Meilisearch User");
})();
