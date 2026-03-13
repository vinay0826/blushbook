import mongoose from "mongoose";
import { env } from "../src/config/env.js";

const MIGRATION_NAME = "002_review_feed_indexes";

async function runMigration() {
  await mongoose.connect(env.mongoUri);
  const db = mongoose.connection.db;
  const migrations = db.collection("migrations");

  const alreadyRan = await migrations.findOne({ name: MIGRATION_NAME });
  if (alreadyRan) {
    console.log(`${MIGRATION_NAME} already ran at ${alreadyRan.ranAt.toISOString()}`);
    await mongoose.disconnect();
    return;
  }

  const reviews = db.collection("reviews");

  await reviews.createIndex({ userId: 1, createdAt: -1 });
  await reviews.createIndex({ likes: -1, createdAt: -1 });
  await reviews.createIndex({ bookTitle: 1 });
  await reviews.createIndex({ username: "text", bookTitle: "text" });

  await migrations.insertOne({
    name: MIGRATION_NAME,
    ranAt: new Date()
  });

  console.log(`${MIGRATION_NAME} completed`);
  await mongoose.disconnect();
}

runMigration().catch(async (error) => {
  console.error("Migration failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
