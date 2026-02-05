import { Router, type Request, type Response } from "express";
import { config } from "@configs";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    app: config.APP_NAME,
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
