// controllers/AuthController.ts
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
// import bodyParser from 'body-parser';
import { verifyPassword } from "../utils/password.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "votre_secret";

class AuthController {
  constructor() {
    this.login = this.login.bind(this); // Lier la méthode au contexte de la classe
  }

  async login(req: Request, res: Response) {
    const { telephone, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { telephone } });

      if (!user) {
        return res.status(404).json({
          data: null,
          status: "KO",
          message: "l'email ou le mot de passe est incorrect",
        });
      }

      const isMatch = await verifyPassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          data: null,
          message: "l'email ou le mot de passe est incorrect",
          status: "KO",
        });
      }

      const codeVerification = this.generateVerificationCode();

      await prisma.user.update({
        where: { telephone },
        data: { code_verification: codeVerification },
      });

      return res.status(200).json({
        status: "OK",
        data: { id: user.id, telephone: user.telephone, codeVerification },
        message: "Un code de verification a ete envoye",
      });
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return res.status(500).json({
        data: null,
        status: "KO",
        message: "Erreur lors de la connexion",
      });
    }
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyCode(req: Request, res: Response) {
    const { code_verification } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { code_verification }, // assuming `code` is a unique field in your User model
      });

      if (!user) {
        return res.status(401).json({
          data: null,
          status: "KO",
          message: "Code de vérification incorrect",
        });
      }

      const token = jwt.sign(
        { id: user.id, telephone: user.telephone, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        status: "OK",
        data: { token },
        message: "Vérification réussie",
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        status: "KO",
        message: "Erreur lors de la vérification",
      });
    }
  }
}

export default new AuthController();
