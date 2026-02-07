// packages/backend/src/db/migrate.ts
import "dotenv/config";
import mongoose from "mongoose";
import { readdirSync } from "fs";
import { join } from "path";
import { connectDB, disconnectDB } from "./connection";
import { MigrationRecord } from "./migration.model";

export interface MigrationContext {
  connection: mongoose.Connection;
}

export interface MigrationModule {
  name: string;
  up: (ctx: MigrationContext) => Promise<void>;
  down: (ctx: MigrationContext) => Promise<void>;
}

const MIGRATIONS_DIR = join(__dirname, "migrations");

function loadMigrations(): MigrationModule[] {
  const ext = __dirname.includes("dist") ? ".js" : ".ts";
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(ext) && /^\d+_.+\.(ts|js)$/.test(f))
    .sort();
  const out: MigrationModule[] = [];
  for (const file of files) {
    const mod = require(join(MIGRATIONS_DIR, file)) as { default: MigrationModule };
    if (mod.default?.name && typeof mod.default.up === "function" && typeof mod.default.down === "function") {
      out.push(mod.default);
    }
  }
  return out;
}

async function getAppliedNames(): Promise<string[]> {
  const docs = await MigrationRecord.find({}).sort({ name: 1 }).lean().exec();
  return docs.map((d) => d.name);
}

export async function migrateUp(uri: string): Promise<{ run: number }> {
  await connectDB(uri);
  try {
    const migrations = loadMigrations();
    const applied = await getAppliedNames();
    const toRun = migrations.filter((m) => !applied.includes(m.name));
    const ctx: MigrationContext = { connection: mongoose.connection };
    for (const m of toRun) {
      await m.up(ctx);
      await MigrationRecord.create({ name: m.name, appliedAt: new Date() });
      console.log(`Migrated up: ${m.name}`);
    }
    return { run: toRun.length };
  } finally {
    await disconnectDB();
  }
}

export async function migrateDown(uri: string, steps: number = 1): Promise<{ run: number }> {
  await connectDB(uri);
  try {
    const migrations = loadMigrations();
    const applied = await getAppliedNames();
    const toRevert = migrations
      .filter((m) => applied.includes(m.name))
      .reverse()
      .slice(0, steps);
    const ctx: MigrationContext = { connection: mongoose.connection };
    for (const m of toRevert) {
      await m.down(ctx);
      await MigrationRecord.deleteOne({ name: m.name }).exec();
      console.log(`Migrated down: ${m.name}`);
    }
    return { run: toRevert.length };
  } finally {
    await disconnectDB();
  }
}

async function main(): Promise<void> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const downFlag = args.find((a) => a.startsWith("--steps="));
  const steps = downFlag ? parseInt(downFlag.split("=")[1] ?? "1", 10) : 0;

  if (steps > 0) {
    const { run } = await migrateDown(uri, steps);
    console.log(`Reverted ${run} migration(s).`);
  } else {
    const { run } = await migrateUp(uri);
    console.log(`Applied ${run} migration(s).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
