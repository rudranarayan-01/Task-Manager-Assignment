import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

interface JWTPayload {
    userId: string;
}

export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ userId }, ACCESS_SECRET!, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId }, REFRESH_SECRET!, { expiresIn: '7d' });
};
