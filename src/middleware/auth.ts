import jwt from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import {AuthenticatedRequest} from "../interface/Interface";

// middleware/authMiddleware.ts

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret';

export const isAuthenticatedGlobal = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Accès non autorisé, token manquant" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string }; // Décodage du token
    req.user = { id: decoded.id, role: decoded.role }; // Ajout des données à la requête
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};
