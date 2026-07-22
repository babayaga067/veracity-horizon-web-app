import { beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

/**
 * Global integration-test harness.
 *
 * Spins up an in-memory MongoDB instance (MongoMemoryServer) so the full
 * repository + model + service + controller + route stack runs against a real
 * database without external infrastructure. The connection string is injected
 * into the environment BEFORE the Mongoose models are imported.
 */

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri("veracity_horizon_test");
  process.env.MONGODB_URL = uri;
  process.env.SECRET_KEY = process.env.SECRET_KEY || "test-secret-key";
  process.env.PORT = process.env.PORT || "0";
  await mongoose.connect(uri);
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 120000);

beforeEach(async () => {
  // Isolate each test by clearing collections between runs.
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});
