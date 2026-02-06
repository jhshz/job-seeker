import { Router, type Request, type Response } from "express";
import { config } from "@configs";
import authRoutes from "./auth.routes";
import seekersRoutes from "./seekers.routes";
import recruitersRoutes from "./recruiters.routes";
import jobsRoutes from "./jobs.routes";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      app: config.APP_NAME,
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

router.use("/auth", authRoutes);
router.use("/seekers", seekersRoutes);
router.use("/recruiters", recruitersRoutes);
router.use("/jobs", jobsRoutes);

export default router;
