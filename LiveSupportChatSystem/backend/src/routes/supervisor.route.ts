import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

const router: Router = Router();

router.use(authMiddleware);

// GET /supervisor/agents
router.get("/agents", async (req, res) => {
    try {
        const supervisorId = req.user?.userId;
        const role = req.user?.role;

        if (!supervisorId || role !== "SUPERVISOR") {
            return res.status(403).json({ message: "Access denied. Only supervisors can access this resource" });
        }

        const agents = await prisma.user.findMany({
            where: {
                supervisorID: supervisorId,
                role: "AGENT",
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return res.status(200).json({ agents });
    } catch (error: any) {
        console.error("GetSupervisorAgents error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

export { router as SupervisorRouter };
