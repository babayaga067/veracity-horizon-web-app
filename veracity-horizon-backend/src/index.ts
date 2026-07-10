import app from "./app";
import { connectToMongoDB } from "./database/mongodb";
import { PORT } from "./configs/constant";

async function bootstrap() {
  try {
    await connectToMongoDB();
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
