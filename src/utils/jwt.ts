import jwt from "jsonwebtoken";

const createJWT = (payload: Record<string, any>) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET+"", {
        expiresIn: process.env.JWT_LIFETIME,
    });
    return token;
};

const isTokenValid = (token: string) => jwt.verify(token, process.env.JWT_SECRET+"");

export { createJWT, isTokenValid };
