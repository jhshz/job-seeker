// packages/backend/src/db/migrations/1738900000000_add_job_and_otp_indexes.ts
import type { MigrationContext } from "../migrate";

const name = "1738900000000_add_job_and_otp_indexes";

async function up(ctx: MigrationContext): Promise<void> {
  const db = ctx.connection.db;
  if (!db) throw new Error("No db");

  const jobs = db.collection("jobs");
  const otpRequests = db.collection("otprequests");

  const jobIndexes = await jobs.indexes();
  const hasJobSearch = jobIndexes.some(
    (idx) => idx.name === "status_1_createdAt_-1_salaryMin_1_salaryMax_1"
  );
  if (!hasJobSearch) {
    await jobs.createIndex(
      { status: 1, createdAt: -1, salaryMin: 1, salaryMax: 1 },
      { name: "status_1_createdAt_-1_salaryMin_1_salaryMax_1" }
    );
  }

  const otpIndexes = await otpRequests.indexes();
  const hasOtpActive = otpIndexes.some(
    (idx) => idx.name === "phoneE164_1_purpose_1_usedAt_1_createdAt_-1"
  );
  if (!hasOtpActive) {
    await otpRequests.createIndex(
      { phoneE164: 1, purpose: 1, usedAt: 1, createdAt: -1 },
      { name: "phoneE164_1_purpose_1_usedAt_1_createdAt_-1" }
    );
  }
}

async function down(ctx: MigrationContext): Promise<void> {
  const db = ctx.connection.db;
  if (!db) throw new Error("No db");

  const jobs = db.collection("jobs");
  const otpRequests = db.collection("otprequests");

  try {
    await jobs.dropIndex("status_1_createdAt_-1_salaryMin_1_salaryMax_1");
  } catch {
    // index may not exist
  }
  try {
    await otpRequests.dropIndex("phoneE164_1_purpose_1_usedAt_1_createdAt_-1");
  } catch {
    // index may not exist
  }
}

export default { name, up, down };
