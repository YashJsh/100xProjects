import bcrypt from "bcrypt"

export const hashPassword = async (password: string): Promise<string> => {
    const hashed_password = await bcrypt.hash(password, 10);
    return hashed_password
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    const compared_password = await bcrypt.compare(password, hash);
    return compared_password
};
