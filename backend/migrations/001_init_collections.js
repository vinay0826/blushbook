import mongoose from "mongoose";
import { env } from "../src/config/env.js";

const MIGRATION_NAME = "001_init_collections";

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

  await createCollectionIfMissing(db, "users");
  await createCollectionIfMissing(db, "reviews");
  await createCollectionIfMissing(db, "shelfitems");

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("reviews").createIndex({ createdAt: -1 });
  await db.collection("shelfitems").createIndex({ createdAt: -1 });

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
