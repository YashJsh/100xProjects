import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Check for token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    // 2. Split token Bearer 
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        // 3. Verify token get the payload
        const payload = verifyToken(token);

        // 4. Put the object in the request
        req.user = payload as any;

        // 6. Call Next Function
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
