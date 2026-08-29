import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const createConversationController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (role !== "CANDIDATE") {
            return res.status(403).json({ message: "Only candidates can create a conversation" });
        }

        const conversation = await prisma.conversation.create({
            data: {
                candidateID: userId,
                status: "OPEN",
            },
        });

        return res.status(201).json({
            message: "Conversation created successfully",
            conversation,
        });
    } catch (error: any) {
        console.error("CreateConversation error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getConversationController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const id = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!id) {
            return res.status(400).json({ message: "Conversation ID is required" });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
                agent: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const isCandidate = conversation.candidateID === userId;
        const isAssignedAgent = conversation.agentID === userId;
        const isSupervisorOrAdmin = role === "SUPERVISOR" || role === "ADMIN";

        if (!isCandidate && !isAssignedAgent && !isSupervisorOrAdmin) {
            return res.status(403).json({ message: "You do not have permission to view this conversation" });
        }

        return res.status(200).json({ conversation });
    } catch (error: any) {
        console.error("GetConversation error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const assignConversationController = async (req: Request, res: Response) => {
    try {
        const supervisorId = req.user?.userId!;
        const role = req.user?.role!;
        const id = req.params.id as string;
        const { agentId } = req.body;

        if (!agentId) {
            return res.status(400).json({ message: "agentId is required in request body" });
        }

        if (role !== "SUPERVISOR") {
            return res.status(403).json({ message: "Only supervisors can assign conversations" });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id },
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        } 
        if (conversation.status === "CLOSED") {
            return res.status(400).json({ message: "Cannot assign or re-assign a closed conversation" });
        }

        // Checking if target agent belongs to this supervisor
        const agent = await prisma.user.findFirst({
            where: {
                id: agentId,
                supervisorID: supervisorId,
                role: "AGENT",
            },
        });
        if (!agent) {
            return res.status(404).json({ message: "Agent not found or does not belong to this supervisor" });
        }

        // Check if target agent is free (has 0 IN_PROGRESS chats)
        // Also we are checking the re-assigned agent should not be our previous agent 
        const busyChat = await prisma.conversation.findFirst({
            where: {
                agentID: agentId,
                status: "IN_PROGRESS",
                NOT: { id },
            },
        });

        if (busyChat) {
            return res.status(400).json({ message: "This agent is currently busy with another active chat" });
        }

        const updatedConversation = await prisma.conversation.update({
            where: { id },
            data: {
                agentID: agentId,
                status: "IN_PROGRESS",
            },
        });

        return res.status(200).json({
            message: conversation.status === "IN_PROGRESS" ? "Conversation re-assigned successfully" : "Conversation assigned successfully",
            assignedAgent: {
                id: agent.id,
                name: agent.name,
                email: agent.email,
            },
            conversation: updatedConversation,
        });
    } catch (error: any) {
        console.error("AssignConversation error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const closeConversationController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const id = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!id) {
            return res.status(400).json({ message: "Conversation ID is required" });
        }

        if (role !== "AGENT") {
            return res.status(403).json({ message: "Only the assigned agent can close a conversation" });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id },
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (conversation.status === "CLOSED") {
            return res.status(400).json({ message: "Conversation is already closed" });
        }

        if (conversation.status !== "IN_PROGRESS") {
            return res.status(400).json({ message: "Only in-progress conversations can be closed" });
        }

        if (conversation.agentID !== userId) {
            return res.status(403).json({ message: "You can only close conversations assigned to you" });
        }

        const updatedConversation = await prisma.conversation.update({
            where: { id },
            data: {
                status: "CLOSED",
            },
        });

        return res.status(200).json({
            message: "Conversation closed successfully",
            conversation: updatedConversation,
        });
    } catch (error: any) {
        console.error("CloseConversation error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllConversationController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let whereCondition: any = {};

        if (role === "CANDIDATE") {
            whereCondition = { candidateID: userId };
        } else if (role === "AGENT") {
            whereCondition = { agentID: userId };
        } else if (role === "SUPERVISOR") {
            whereCondition = {
                OR: [
                    { agent: { supervisorID: userId } }
                ],
            };
        }

        const conversations = await prisma.conversation.findMany({
            where: whereCondition,
            include: {
                agent: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({ conversations });
    } catch (error: any) {
        console.error("GetAllConversation error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};