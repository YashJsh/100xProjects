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
const PORT = process.env.PORT || process.env.HTTP_PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();
const server = http.createServer(app);

initWebSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

app.use("/auth", AuthRouter);
app.use("/conversations", authMiddleware, ConversationRouter);
app.use("/admin", authMiddleware, AdminRouter);
app.use("/supervisor", authMiddleware, SupervisorRouter);

server.listen(PORT, () => {
  console.log(`🚀 Backend Server listening on PORT : ${PORT}`);
  console.log(`🌐 Allowed CORS Frontend URL : ${FRONTEND_URL}`);
});