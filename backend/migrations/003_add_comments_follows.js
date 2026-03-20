import mongoose from "mongoose";
import { env } from "../src/config/env.js";

const MIGRATION_NAME = "003_add_comments_follows";

async function createCollectionIfMissing(db, name) {
  const existing = await db.listCollections({ name }).toArray();
  if (existing.length === 0) {
    await db.createCollection(name);
  }
}

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

  await createCollectionIfMissing(db, "comments");
  await createCollectionIfMissing(db, "follows");

  await db.collection("comments").createIndex({ reviewId: 1, createdAt: 1 });
  await db.collection("comments").createIndex({ parentId: 1, createdAt: 1 });
  await db.collection("comments").createIndex({ userId: 1, createdAt: -1 });

  await db.collection("follows").createIndex({ followerId: 1, followingId: 1 }, { unique: true });
  await db.collection("follows").createIndex({ followingId: 1 });

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
