import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/token";

const signUpSchema = z.object({
    email: z.string().email("Invalid email format"),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["CANDIDATE", "SUPERVISOR", "AGENT", "ADMIN"]).optional().default("CANDIDATE"),
    supervisorID: z.string().optional(),
});

const signInSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export const signUpController = async (req: Request, res: Response) => {
    try {
        const parsed = signUpSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.issues,
            });
        }

        const { email, name, password, role, supervisorID } = parsed.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
                ...(supervisorID ? { supervisorID } : {}),
            },
        });

        const token = generateToken({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
        });

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
            },
        });
    } catch (error: any) {
        console.error("SignUp error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const signInController = async (req: Request, res: Response) => {
    try {
        const parsed = signInSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.issues,
            });
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return res.status(200).json({
            message: "Signed in successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error("SignIn error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMeController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                supervisorID: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error: any) {
        console.error("GetMe error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
