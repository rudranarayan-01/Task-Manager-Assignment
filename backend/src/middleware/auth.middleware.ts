import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { prisma } from "../lib/client.js";

interface JWTPayload {
    userId: string;
}

export interface AuthRequest extends Request {
    user?: { userId: string };
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;

export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET) as JWTPayload;


        const user = await prisma.user.findUnique({
            where: { id: payload.userId }
        });

        if (!user) {
            return res.status(403).json({ message: "User no longer exists" });
        }

        req.user = { userId: payload.userId };
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};