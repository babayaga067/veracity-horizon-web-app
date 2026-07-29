import app from "./app";
import { connectToMongoDB } from "./database/mongodb";
import { PORT, MONGODB_URL, SECRET_KEY } from "./configs/constant";
import { startAuctionScheduler } from "./schedulers/auction.scheduler";

function validateEnv(): void {
  const missing: string[] = [];
  if (!MONGODB_URL) missing.push("MONGODB_URL");
  if (!SECRET_KEY) missing.push("SECRET_KEY");
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function bootstrap() {
  try {
    validateEnv();
    await connectToMongoDB();
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startAuctionScheduler();
      console.log("Auction scheduler started");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
