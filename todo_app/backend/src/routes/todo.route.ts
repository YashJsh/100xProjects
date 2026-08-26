import { Router } from "express";
import {
  createTodo,
  getAllTodos,
  updateTodo,
  deleteTodo,
  toggleTodo,
} from "../controllers/todo.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createTodo);
router.get("/", getAllTodos);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);
router.patch("/:id/toggle", toggleTodo);

export default router;
