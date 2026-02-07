// packages/backend/src/db/connection.ts
import mongoose from "mongoose";

export async function connectDB(uri: string): Promise<mongoose.Mongoose> {
  const conn = await mongoose.connect(uri);
  return conn;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
