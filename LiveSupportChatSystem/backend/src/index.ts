import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { AuthRouter } from "./routes/auth.route";
import { ConversationRouter } from "./routes/conversation.route";
import { authMiddleware } from "./middleware/auth.middleware";
import { AdminRouter } from "./routes/admin.route";
import { SupervisorRouter } from "./routes/supervisor.route";
import { initWebSocket } from "./socket";

dotenv.config();
const HTTP_PORT = process.env.HTTP_PORT || 3000;

const app = express();
const server = http.createServer(app);

initWebSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/auth", AuthRouter);
app.use("/conversations", authMiddleware, ConversationRouter);
app.use("/admin", authMiddleware, AdminRouter);
app.use("/supervisor", authMiddleware, SupervisorRouter);

server.listen(HTTP_PORT, () => {
    console.log(`Server is listening on PORT : ${HTTP_PORT}`);
});