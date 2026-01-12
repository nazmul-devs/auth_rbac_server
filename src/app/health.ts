import { Application, Request, Response } from "express";

export const registerHealthCheck = (app: Application) => {
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });
};
