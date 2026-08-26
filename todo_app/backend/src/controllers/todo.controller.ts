import type { Request, Response } from "express";
import { todos } from "../store/app.store";
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const createTodo = (req: Request, res: Response) => {
  const parsed = createTodoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = (req as any).userId;
  const id = crypto.randomUUID();
  const todo = {
    id,
    userId,
    title: parsed.data.title,
    description: parsed.data.description,
    completed: false,
    deletedOn: null,
    createdAt: new Date(),
  };

  todos.set(id, todo);
  res.status(201).json(todo);
};

export const getAllTodos = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const userTodos = [];

  for (const todo of todos.values()) {
    if (todo.userId === userId && todo.deletedOn === null) {
      userTodos.push(todo);
    }
  }

  res.status(200).json(userTodos);
};

export const updateTodo = (req: Request, res: Response) => {
  const parsed = updateTodoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = (req as any).userId;
  const todo = todos.get(req.params.id as string) ;

  if (!todo || todo.userId !== userId || todo.deletedOn !== null) {
    return res.status(404).json({ error: "Todo not found" });
  }

  if (parsed.data.title !== undefined) todo.title = parsed.data.title;
  if (parsed.data.description !== undefined)
    todo.description = parsed.data.description;

  res.status(200).json(todo);
};

export const deleteTodo = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const todo = todos.get(req.params.id as string);

  if (!todo || todo.userId !== userId || todo.deletedOn !== null) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todo.deletedOn = new Date();
  res.status(200).json({ message: "Todo deleted" });
};

export const toggleTodo = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const todo = todos.get(req.params.id as string);

  if (!todo || todo.userId !== userId || todo.deletedOn !== null) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todo.completed = !todo.completed;
  res.status(200).json(todo);
};
