import express from "express";
import authRoutes from "./routes/auth.routes";
import todoRoutes from "./routes/todo.route";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Todo API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
