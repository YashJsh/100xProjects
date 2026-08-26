import type { Request, Response } from "express";
import { users, type User } from "../store/app.store";
import { encryptPassword, verifyPassword } from "../utils/password";
import { createToken } from "../utils/token";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { name, email, password } = parsed.data;

  for (const user of users.values()) {
    if (user.email === email) {
      return res.status(409).json({ error: "Email already exists" });
    }
  }

  const hashedPassword = await encryptPassword(password);
  const id = crypto.randomUUID();
  const user = { id, name, email, password: hashedPassword };

  users.set(id, user);
  const token = createToken(id);

  res.status(201).json({ token, user: { id, name, email } });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;
  let found: User | undefined;

  for (const user of users.values()) {
    if (user.email === email) {
      found = user;
      break;
    }
  }

  if (!found) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await verifyPassword(password, found.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = createToken(found.id);
  res.json({ token, user: { id: found.id, name: found.name, email } });
};
