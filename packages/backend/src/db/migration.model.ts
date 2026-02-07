// packages/backend/src/db/migration.model.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMigrationRecord extends Document {
  name: string;
  appliedAt: Date;
  checksum?: string;
}

const migrationSchema = new Schema<IMigrationRecord>(
  {
    name: { type: String, required: true, unique: true },
    appliedAt: { type: Date, required: true, default: Date.now },
    checksum: { type: String, default: null },
  },
  { timestamps: false },
);

// name already has unique: true above, which creates the index

export const MigrationRecord: Model<IMigrationRecord> =
  mongoose.models.MigrationRecord ||
  mongoose.model<IMigrationRecord>("MigrationRecord", migrationSchema, "migrations");
