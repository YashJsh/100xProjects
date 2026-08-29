import ws, { WebSocketServer } from "ws";
import { Socket } from "net";
import { IncomingMessage, Server } from "http"
import { verifyToken } from "../utils/token";
import { EventTypes, type Message } from "./socket.type";
import { conversation_instance } from "./conversation";
import type { AuthPayload } from "../types/auth.types";

export function initWebSocket(server: Server) {
    const wss = new WebSocketServer({
        noServer: true
    });
    server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
        try {
            const url = new URL(req.url!, "http://localhost");
            console.log("Path Name is : ", url.pathname)

            if (url.pathname !== "/ws") {
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                socket.destroy()
                return;
            }

            const params = url.searchParams;
            const token = params.get("token")

            if (!token) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy()
                return;
            }
            const payload = verifyToken(token)
            if (!payload) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }

            wss.handleUpgrade(req, socket, head, (ws) => {
                (ws as any).user = payload;
                wss.emit("connection", ws, req)
            });
        } catch (error) {
            console.error("Error during WebSocket upgrade:", error);
            socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
            socket.destroy();
        }
    });

    wss.on("connection", (ws) => {
        const user = (ws as any).user as AuthPayload;
        console.log("Websocket Client Connected");
        ws.on("message", async (data) => {
            try {
                const body: Message<unknown> = JSON.parse(data.toString());
                switch (body.event) {
                    case EventTypes.JOIN_CONVERSATION: {
                        await conversation_instance.join_conversation(ws, body.data, user);
                        break;
                    }
                    case EventTypes.CLOSE_CONVERSATION: {
                        await conversation_instance.close_conversation(ws, body.data, user);
                        break;
                    }
                    case EventTypes.LEAVE_CONVERSATION: {
                        conversation_instance.leave_conversation(ws, body.data, user);
                        break;
                    }
                    case EventTypes.SEND_MESSAGE: {
                        await conversation_instance.send_message(ws, body.data, user);
                        break;
                    }
                    default: {
                        console.warn("Unknown event:", body.event);
                        break;
                    }
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
                ws.send(JSON.stringify({
                    event: EventTypes.ERROR,
                    data: { message: "Invalid JSON format" }
                }));
            }
        });
        ws.on("close", () => {
            console.log("Client disconnected");
        });
        ws.on("error", (error)=>{
            ws.emit(JSON.stringify({
                "success" : false,
                "error" : error
            }))
        })
    });
}
