import { Router } from "express";
import userController from "../controllers/user.controller";
import { asyncHandler } from "../middleware/asyncHandler.middleware";

const router = Router();

router.post("/", asyncHandler(userController.createUser.bind(userController)));
router.get("/", asyncHandler(userController.getAllUsers.bind(userController)));
router.get(
  "/:id",
  asyncHandler(userController.getUserById.bind(userController))
);

export default router;
