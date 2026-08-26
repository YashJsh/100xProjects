import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  const payload = verifyToken(token as string);

  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  (req as any).userId = payload.userId;
  next();
};
