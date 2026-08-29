import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getSupervisorAgentsController } from "../controllers/supervisor.controller";

const router: Router = Router();

router.use(authMiddleware);

// GET /supervisor/agents
router.get("/agents", getSupervisorAgentsController);

export { router as SupervisorRouter };
