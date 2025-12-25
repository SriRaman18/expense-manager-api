import { Router } from "express";
import healthController from "../controllers/health.controller";
import userRoutes from "./user.routes";
import healthRoutes from "./health.routes";

const router = Router();

// Root endpoint
router.get("/", healthController.getApiInfo.bind(healthController));

// Health check endpoint
router.use("/health", healthRoutes);

// API routes
router.use("/api/users", userRoutes);

export default router;
