import { Router } from "express";
import PathController from "../controllers/path.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public routes (no authentication required)
router.get("/", PathController.searchPaths);
router.get("/category/:category", PathController.getPathsByCategory);
router.get("/stats", PathController.getPathStats);

// Protected routes (authentication required)
router.post("/", authenticate, PathController.createPath);
router.get("/:id", PathController.getPathById);
router.put("/:id", authenticate, PathController.updatePath);
router.delete("/:id", authenticate, PathController.deletePath);

export default router;
