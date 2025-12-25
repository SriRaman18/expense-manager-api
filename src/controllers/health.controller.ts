import { Request, Response } from "express";
import prisma from "../config/database";

class HealthController {
  async checkHealth(_req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "connected",
        environment: process.env.NODE_ENV || "development",
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  getApiInfo(_req: Request, res: Response): void {
    res.json({
      message: "Expense Manager API",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        users: {
          create: "POST /api/users",
          getAll: "GET /api/users",
          getById: "GET /api/users/:id",
        },
      },
    });
  }
}

export default new HealthController();
