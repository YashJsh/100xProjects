import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getAdminAnalyticsController,
  assignAgentToSupervisorController,
} from "../controllers/admin.controller";

const router: Router = Router();

router.use(authMiddleware);

// GET /admin/analytics
router.get("/analytics", getAdminAnalyticsController);

// POST /admin/assign-agent
router.post("/assign-agent", assignAgentToSupervisorController);

export { router as AdminRouter };
