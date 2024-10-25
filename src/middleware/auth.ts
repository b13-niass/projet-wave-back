import jwt from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import {AuthenticatedRequest, IMiddlewareUser} from "../interface/Interface";

export const isAuthenticatedGlobal = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ message: 'Token is required' });
    }

    jwt.verify(token, process.env.JWT_SECRET+"", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        const user = decoded as IMiddlewareUser;
        req.id = user.id;
        next();
    })
}