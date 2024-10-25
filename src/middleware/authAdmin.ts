import jwt from "jsonwebtoken";
import {AuthenticatedRequest, IMiddlewareUser} from "../interface/Interface";
import {NextFunction, Response} from "express";

export const isAdminAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction)  => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ message: 'Token is required', status: 'KO' });
    }

    jwt.verify(token, process.env.JWT_SECRET+"", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token', status: 'KO' });
        }
        // res.json({ message: 'Access granted', user });
        const user = decoded as IMiddlewareUser;
        if(user && user.role === 'admin'){
            req.id = user.id;
            next();
        }else {
            res.status(403).json({message: 'No Authorization', status: 'KO'});
        }
    })
    
    
}