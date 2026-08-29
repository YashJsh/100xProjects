import type { Role } from "@prisma/client";

export interface AuthPayload {
    userId: string;
    email: string;
    role: Role;
}