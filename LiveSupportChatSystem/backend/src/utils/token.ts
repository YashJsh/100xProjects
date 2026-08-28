import * as jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/auth.types";

export const generateToken = (payload: AuthPayload): string => {
    if (!process.env.JWT_SECRET){
        throw new Error("JWT Secret is not defined")
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
    return token;
};

export const verifyToken = (token: string) => {
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded_token;
};
