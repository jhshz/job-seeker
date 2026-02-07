// packages/backend/src/db/migrations/1738900000001_backfill_user_roles.ts
import type { MigrationContext } from "../migrate";

const name = "1738900000001_backfill_user_roles";

const UserRole = { SEEKER: "seeker", RECRUITER: "recruiter" } as const;

async function up(ctx: MigrationContext): Promise<void> {
  const db = ctx.connection.db;
  if (!db) throw new Error("No db");

  const users = db.collection("users");
  const seekerProfiles = db.collection("seekerprofiles");
  const recruiterProfiles = db.collection("recruiterprofiles");

  const seekers = await seekerProfiles.find({}, { projection: { userId: 1 } }).toArray();
  const recruiters = await recruiterProfiles.find({}, { projection: { userId: 1 } }).toArray();

  for (const s of seekers) {
    const uid = s.userId;
    await users.updateOne(
      { _id: uid },
      { $addToSet: { roles: UserRole.SEEKER } }
    );
  }
  for (const r of recruiters) {
    const uid = r.userId;
    await users.updateOne(
      { _id: uid },
      { $addToSet: { roles: UserRole.RECRUITER } }
    );
  }
}

async function down(ctx: MigrationContext): Promise<void> {
  const db = ctx.connection.db;
  if (!db) throw new Error("No db");

  const users = db.collection("users");
  await users.updateMany({}, { $pull: { roles: UserRole.SEEKER } });
  await users.updateMany({}, { $pull: { roles: UserRole.RECRUITER } });
}

export default { name, up, down };
