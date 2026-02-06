// packages/backend/src/services/application.service.ts
import { JobApplication } from "@models";
import { AppError } from "@middlewares";

export class ApplicationService {
  async getById(applicationId: string) {
    const app = await JobApplication.findById(applicationId)
      .populate("jobId")
      .populate("seekerId")
      .populate("resumeSnapshotId")
      .lean();
    if (!app) throw new AppError("Application not found", 404, false, "APPLICATION_NOT_FOUND");
    return app;
  }
}

export const applicationService = new ApplicationService();
