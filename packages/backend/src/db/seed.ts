// packages/backend/src/db/seed.ts
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "./connection";
import { migrateUp } from "./migrate";
import { runSeed } from "./seeds/initial";
// Ensure all models are registered (initial.ts imports them)
import "../models/index";

const isProduction = process.env.NODE_ENV === "production";

function getNumberEnv(key: string, defaultVal: number): number {
  const v = process.env[key];
  if (v == null || v === "") return defaultVal;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? defaultVal : n;
}

async function wipeCollections(): Promise<void> {
  if (isProduction) {
    throw new Error("Wipe is not allowed when NODE_ENV=production");
  }
  const collections = [
    "jobapplications",
    "savedjobs",
    "jobs",
    "resumes",
    "seekerprofiles",
    "recruiterprofiles",
    "fileuploads",
    "activitylogs",
    "refreshtokens",
    "otprequests",
    "users",
    "migrations",
  ];
  for (const name of collections) {
    try {
      await mongoose.connection.db?.collection(name).drop();
      console.log(`Dropped: ${name}`);
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      if (!m.includes("ns not found")) console.warn(`Drop ${name}:`, m);
    }
  }
}

async function main(): Promise<void> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const wipeFirst = process.argv.includes("--wipe");
  const doReset = process.argv.includes("--reset");

  if ((wipeFirst || doReset) && isProduction) {
    console.error("Wipe/reset is not allowed when NODE_ENV=production");
    process.exit(1);
  }

  await connectDB(uri);

  try {
    if (wipeFirst || doReset) {
      await wipeCollections();
    }
    if (doReset) {
      await disconnectDB();
      const { run } = await migrateUp(uri);
      console.log(`Applied ${run} migration(s).`);
      await connectDB(uri);
    }

    const opts = {
      recruiters: getNumberEnv("SEED_RECRUITERS", 2),
      jobsPerRecruiter: getNumberEnv("SEED_JOBS_PER_RECRUITER", 10),
      seekers: getNumberEnv("SEED_SEEKERS", 5),
    };
    await runSeed(opts);
    console.log("Seed completed.");
  } finally {
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
