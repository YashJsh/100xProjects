import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getSupervisorAgentsController = async (req: Request, res: Response) => {
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
};
