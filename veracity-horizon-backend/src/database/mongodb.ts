import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";

export async function connectToMongoDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URL);
    // Connected successfully
  } catch (err) {
    // Re-throw so bootstrap can fail fast
    throw err;
  }
}

