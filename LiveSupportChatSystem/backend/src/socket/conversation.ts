import { WebSocket } from "ws";
import type { AuthPayload } from "../types/auth.types";
import { prisma } from "../utils/prisma";
import { Role, Status } from "@prisma/client";

import { EventTypes, type ServerToClientPayload, type ErrorPayload, type ConversationClosedPayload } from "./socket.type";

class Conversation {
    private conversation: Map<string, Map<string, WebSocket>>;
    constructor() {
        this.conversation = new Map();
    }

    private sendError(socket: WebSocket, message: string) {
        const errorPayload: ErrorPayload = {
            event: EventTypes.ERROR,
            data: { message }
        };
        socket.send(JSON.stringify(errorPayload));
    }

    public async join_conversation<T>(socket: WebSocket, data: T, user: AuthPayload) {
        const body = data as { conversationId: string }

        if (user.role !== Role.CANDIDATE && user.role !== Role.AGENT) {
            return this.sendError(socket, "Only candidate and agent can view the conversation");
        }

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: body.conversationId
            }
        });
        if (!conversation) {
            return this.sendError(socket, "No conversation exists");
        }

        if (conversation.candidateID !== user.userId && conversation.agentID !== user.userId) {
            return this.sendError(socket, "Either candidate or the agent join the conversation only");
        };

        let conversation_room = this.conversation.get(body.conversationId);
        if (!conversation_room) {
            conversation_room = new Map();
            this.conversation.set(body.conversationId, conversation_room)
        }
        conversation_room.set(user.userId, socket)

        return socket.send(JSON.stringify({
            success: true,
            data: "Conversation joined successfully"
        }))
    }

    public async send_message<T>(socket: WebSocket, data: T, user: AuthPayload) {
        const payload = data as {
            conversationId: string,
            content: string
        }
        try {
            const conversation_room = this.conversation.get(payload.conversationId);
            if (!conversation_room) {
                return this.sendError(socket, "Room is not present");
            }

            if (!conversation_room.get(user.userId)) {
                return this.sendError(socket, "Conversation doesn't have user registered");
            }

            const newMessage = await prisma.message.create({
                data: {
                    content: payload.content,
                    senderID: user.userId,
                    role: user.role,
                    conversationID: payload.conversationId
                }
            });

            const sendMessagePayload: ServerToClientPayload = {
                event: EventTypes.NEW_MESSAGE,
                data: {
                    conversationId: payload.conversationId,
                    senderId: user.userId,
                    senderRole: user.role,
                    content: payload.content,
                    createdAt: newMessage.createdAt.toISOString()
                }
            };

            conversation_room.forEach((recipientSocket, id) => {
                if (id !== user.userId && recipientSocket.readyState === WebSocket.OPEN) {
                    recipientSocket.send(JSON.stringify(sendMessagePayload));
                }
            });

            return socket.send(JSON.stringify({
                success: true,
                data: "Message sent successfully"
            }))
        } catch (error) {
            return this.sendError(socket, error instanceof Error ? error.message : String(error));
        }
    }

    public leave_conversation<T>(socket: WebSocket, data: T, user: AuthPayload) {
        const payload = data as { conversationId: string };
        try {
            const conversation_room = this.conversation.get(payload.conversationId);
            if (conversation_room) {
                conversation_room.delete(user.userId);
                if (conversation_room.size === 0) {
                    this.conversation.delete(payload.conversationId);
                }
            }

            return socket.send(JSON.stringify({
                success: true,
                data: "Left conversation successfully"
            }));
        } catch (error) {
            this.sendError(socket, error instanceof Error ? error.message : String(error));
        }
    }

    public async close_conversation<T>(socket: WebSocket, data: T, user: AuthPayload) {
        const payload = data as { conversationId: string };
        try {
            if (user.role !== Role.AGENT) {
                return this.sendError(socket, "Only agents can close a conversation");
            }

            const conversation = await prisma.conversation.findUnique({
                where: { id: payload.conversationId }
            });

            if (!conversation) {
                return this.sendError(socket, "No conversation exists");
            }

            if (conversation.agentID !== user.userId) {
                return this.sendError(socket, "Only the assigned agent can close this conversation");
            }

            if (conversation.status === Status.CLOSED) {
                return this.sendError(socket, "Conversation is already closed");
            }

            await prisma.conversation.update({
                where: { id: payload.conversationId },
                data: { status: Status.CLOSED }
            });

            const conversation_room = this.conversation.get(payload.conversationId);
            if (conversation_room) {
                const notifyPayload: ConversationClosedPayload = {
                    event: EventTypes.CONVERSATION_CLOSED,
                    data: {
                        conversationId: payload.conversationId,
                        closedBy: user.userId
                    }
                };

                conversation_room.forEach((clientSocket) => {
                    if (clientSocket.readyState === WebSocket.OPEN) {
                        clientSocket.send(JSON.stringify(notifyPayload));
                    }
                });

                this.conversation.delete(payload.conversationId);
            }

            return socket.send(JSON.stringify({
                success: true,
                data: "Conversation closed successfully"
            }));
        } catch (error) {
            return this.sendError(socket, error instanceof Error ? error.message : String(error));
        }
    }
}

export const conversation_instance = new Conversation();