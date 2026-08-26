import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "todo-secret-key";

export const createToken = (userId: string): string => {
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, SECRET) as { userId: string };
  } catch {
    return null;
  }
};
