import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const hashRefreshToken = async (token: string): Promise<string> => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(token, salt);
};

export const verifyRefreshToken = async (
    token: string,
    hashedToken: string
): Promise<boolean> => {
    return bcrypt.compare(token, hashedToken);
};
