import { Request, Response } from "express";
import { prisma } from "../lib/client";
import {
    hashPassword,
    comparePassword,
    hashRefreshToken,
    verifyRefreshToken
} from "../utils/hash";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";


// REGISTER 
export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const plainRefreshToken = generateRefreshToken(email);
    const hashedRefreshToken = await hashRefreshToken(plainRefreshToken);

    const user = await prisma.user.create({
        data: {
            name: name || null,
            email,
            password: hashedPassword,
            refreshToken: hashedRefreshToken
        },
    });

    const userId = user.id.toString();

    res.status(201).json({
        message: "User registered successfully",
        accessToken: generateAccessToken(userId),
        refreshToken: plainRefreshToken,
        user: { id: userId, email: user.email, name: user.name }
    });
};

// LOGIN
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const userId = user.id.toString();

    const accessToken = generateAccessToken(userId);
    const plainRefreshToken = generateRefreshToken(userId);
    const hashedRefreshToken = await hashRefreshToken(plainRefreshToken);

    await prisma.user.update({
        where: { id: user.id }, // Prisma handles number internally
        data: { refreshToken: hashedRefreshToken },
    });

    res.json({
        accessToken,
        refreshToken: plainRefreshToken,
        user: { id: userId, email: user.email }
    });
};


// REFRESH TOKEN
export const refresh = async (req: Request, res: Response) => {
    const { refreshToken: plainRefreshToken } = req.body;

    if (!plainRefreshToken) {
        return res.status(400).json({ message: "Refresh token required" });
    }

    const user = await prisma.user.findFirst({
        where: { refreshToken: { not: null } },
    });

    if (!user?.refreshToken || !(await verifyRefreshToken(plainRefreshToken, user.refreshToken))) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    const userId = user.id.toString();
    const newAccessToken = generateAccessToken(userId);
    res.json({ accessToken: newAccessToken });
};


// LOGOUT
export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        await prisma.user.updateMany({
            where: { refreshToken: { not: null } },
            data: { refreshToken: null },
        });
    }

    res.json({ message: "Logged out successfully" });
};
