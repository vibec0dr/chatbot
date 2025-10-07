const { parseArgs } = require("util");
const { parseAndValidateISODate } = require("./helpers/helpers.js");
const { meiliRequest } = require("./helpers/meiliRequest.js");
const { MongoClient } = require("mongodb");

const config = {
  strict: true,
  options: {
    "start-time": { type: "string", short: "s", default: undefined },
    "end-time": { type: "string", short: "e", default: undefined },
    incremental: { type: "boolean", short: "i", default: false },
  },
};

const { values } = parseArgs(config);

async function cleanup(dbClient) {
  console.log("Cleaning up...");
  if (dbClient) await dbClient.close();
}

// Determine range
function getDateRange() {
  const now = new Date();
  let start, end;

  if (values.incremental) {
    start = values["start-time"]
      ? parseAndValidateISODate(values["start-time"], "start-time")
      : new Date(now.getTime() - 12 * 60 * 60 * 1000); // last 12 hours
    end = values["end-time"]
      ? parseAndValidateISODate(values["end-time"], "end-time")
      : now;
  } else {
    start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // last year
    end = now;
  }

  return { start, end };
}

async function createTemporaryIndexes() {
  // copy settings from prod indexes
  await meiliRequest("/indexes/conversations_temp", "POST", {
    /* settings */
  });
  await meiliRequest("/indexes/messages_temp", "POST", {
    /* settings */
  });
}

async function fetchAndInsertFromMongo(
  dbClient,
  collectionName,
  tempIndexName,
  start,
  end
) {
  const batchSize = 500;
  const collection = dbClient.db().collection(collectionName);

  const cursor = collection
    .find({
      createdAt: { $gte: start, $lte: end },
    })
    .batchSize(batchSize);

  while (await cursor.hasNext()) {
    const docs = [];
    for (let i = 0; i < batchSize; i++) {
      if (!(await cursor.hasNext())) break;
      const doc = await cursor.next();
      doc.meleeIndexed = true;
      docs.push(doc);
    }

    await meiliRequest(`/indexes/${tempIndexName}/documents`, "POST", docs);
  }
}

async function swapIndexes() {
  await meiliRequest("/indexes/conversations/swap", "POST", {
    with: "conversations_temp",
  });
  await meiliRequest("/indexes/messages/swap", "POST", {
    with: "messages_temp",
  });
}

async function run() {
  const { start, end } = getDateRange();
  console.log("Syncing documents from", start, "to", end);

  const mongoClient = await MongoClient.connect(process.env.MONGO_URI);

  try {
    await createTemporaryIndexes();

    await fetchAndInsertFromMongo(
      mongoClient,
      "conversations",
      "conversations_temp",
      start,
      end
    );
    await fetchAndInsertFromMongo(
      mongoClient,
      "messages",
      "messages_temp",
      start,
      end
    );

    await swapIndexes();
  } finally {
    await cleanup(mongoClient);
  }

  console.log("Reindexing completed successfully.");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
