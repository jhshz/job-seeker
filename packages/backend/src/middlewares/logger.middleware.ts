import type { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - Started`,
  );

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusIcon = status >= 400 ? "❌" : "✅";

    console.log(
      `[${new Date().toISOString()}] ${statusIcon} ${req.method} ${req.url} ${status} - ${duration}ms`,
    );
  });

  next();
}
