import bcrypt from "bcryptjs";

export const hashPassword = async function (plainPassword : string) {
    try {
        const saltRounds = 10; // Number of salt rounds
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}

export const verifyPassword = async function (plainPassword: string, hashedPassword : string) {
    try {
        const match = await bcrypt.compare(plainPassword, hashedPassword);
        if (match) {
            return true
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error verifying password:', error);
    }
}