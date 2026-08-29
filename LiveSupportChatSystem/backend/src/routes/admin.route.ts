import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";

const router: Router = Router();

router.use(authMiddleware);

// GET /admin/analytics
router.get("/analytics", async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "ADMIN" && role !== "SUPERVISOR") {
      return res.status(403).json({ message: "Access denied. Admin or Supervisor access required" });
    }

    const [
      totalSupervisors,
      totalAgents,
      totalConversations,
      activeConversations,
      closedConversations,
      supervisorsList,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "SUPERVISOR" } }),
      prisma.user.count({ where: { role: "AGENT" } }),
      prisma.conversation.count(),
      prisma.conversation.count({ where: { status: "IN_PROGRESS" } }),
      prisma.conversation.count({ where: { status: "CLOSED" } }),
      prisma.user.findMany({
        where: { role: "SUPERVISOR" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
    ]);

    // For each supervisor, get their agents and counts
    const supervisorsWithMetrics = await Promise.all(
      supervisorsList.map(async (sup) => {
        const agents = await prisma.user.findMany({
          where: {
            supervisorID: sup.id,
            role: "AGENT",
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        let teamTotalConversations = 0;
        const agentsWithCounts = await Promise.all(
          agents.map(async (agent) => {
            const count = await prisma.conversation.count({
              where: { agentID: agent.id },
            });
            teamTotalConversations += count;
            return {
              ...agent,
              conversationsHandled: count,
            };
          })
        );

        return {
          id: sup.id,
          name: sup.name,
          email: sup.email,
          agentsCount: agents.length,
          totalConversationsHandled: teamTotalConversations,
          agents: agentsWithCounts,
        };
      })
    );

    return res.status(200).json({
      metrics: {
        totalSupervisors,
        totalAgents,
        totalConversations,
        activeConversations,
        closedConversations,
      },
      supervisors: supervisorsWithMetrics,
    });
  } catch (error: any) {
    console.error("AdminAnalytics error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export { router as AdminRouter };
