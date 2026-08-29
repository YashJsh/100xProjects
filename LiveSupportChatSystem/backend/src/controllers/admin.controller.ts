import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getAdminAnalyticsController = async (req: Request, res: Response) => {
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
      allAgentsList,
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
      prisma.user.findMany({
        where: { role: "AGENT" },
        select: {
          id: true,
          name: true,
          email: true,
          supervisorID: true,
          createdAt: true,
        },
      }),
    ]);

    // Format supervisor metrics
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

    // Format all agents list with supervisor names
    const formattedAllAgents = await Promise.all(
      allAgentsList.map(async (agent) => {
        let supervisorName = "Unassigned";
        if (agent.supervisorID) {
          const sup = await prisma.user.findUnique({
            where: { id: agent.supervisorID },
            select: { name: true },
          });
          if (sup) supervisorName = sup.name;
        }

        const count = await prisma.conversation.count({
          where: { agentID: agent.id },
        });

        return {
          id: agent.id,
          name: agent.name,
          email: agent.email,
          supervisorID: agent.supervisorID,
          supervisorName,
          conversationsHandled: count,
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
      allAgents: formattedAllAgents,
    });
  } catch (error: any) {
    console.error("AdminAnalytics error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const assignAgentToSupervisorController = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== "ADMIN") {
      return res.status(403).json({ message: "Only Admin can assign agents to supervisors" });
    }

    const { agentId, supervisorId } = req.body;
    if (!agentId || !supervisorId) {
      return res.status(400).json({ message: "agentId and supervisorId are required" });
    }

    const agent = await prisma.user.findFirst({
      where: { id: agentId, role: "AGENT" },
    });
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const supervisor = await prisma.user.findFirst({
      where: { id: supervisorId, role: "SUPERVISOR" },
    });
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    const updatedAgent = await prisma.user.update({
      where: { id: agentId },
      data: { supervisorID: supervisorId },
    });

    return res.status(200).json({
      message: `Agent ${agent.name} assigned to Supervisor ${supervisor.name} successfully`,
      agent: updatedAgent,
    });
  } catch (error: any) {
    console.error("AssignAgentToSupervisor error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
