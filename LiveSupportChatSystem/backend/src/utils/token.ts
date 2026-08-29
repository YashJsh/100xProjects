import jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/auth.types";

const getJwtSecret = (): string => {
    return process.env.JWT_SECRET || "super-secret-jwt-key-live-support";
};

export const generateToken = (payload: AuthPayload): string => {
    const secret = getJwtSecret();
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });
    return token;
};

export const verifyToken = (token: string) => {
    try {
        const decoded_token = jwt.verify(token, getJwtSecret());
        return decoded_token;
    } catch (error) {
        return null;
    }
};
