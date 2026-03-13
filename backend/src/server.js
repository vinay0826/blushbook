import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    await connectDatabase(env.mongoUri);
    const app = createApp();

    app.listen(env.port, () => {
      console.log(`Between The Lines backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
