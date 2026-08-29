import { WebSocketServer } from "ws";
import { Socket } from "net";
import { IncomingMessage, Server } from "http"
import { verifyToken } from "../utils/token";
import { EventTypes, type Message } from "./socket.type";

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

            if (!verifyToken(token)) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }

            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit("connection", ws, req)
            });
        } catch (error) {
            console.error("Error during WebSocket upgrade:", error);
            socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
            socket.destroy();
        }
    });

    wss.on("connection", (ws) => {
        console.log("Websocket Client Connected");
        ws.on("message", (data) => {
            const body : Message<unknown> = JSON.parse(data.toString());
            switch (body.event){
                case EventTypes.JOIN_CONVERSATION: {
                    
                }
                case EventTypes.CLOSE_CONVERSATION: {

                }
                case EventTypes.LEAVE_CONVERSATION: {

                }
                case EventTypes.SEND_MESSAGE: {

                }
                default:{
                    console.warn("Unknown event", body.event);
                    break;
                }
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
