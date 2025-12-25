import { Router } from "express";
import healthController from "../controllers/health.controller";
import { asyncHandler } from "../middleware/asyncHandler.middleware";

const router = Router();

router.get(
  "/",
  asyncHandler(healthController.checkHealth.bind(healthController))
);

export default router;
