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

  // Méthode de connexion
  async login(req: Request, res: Response) {
    const { telephone, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { telephone } });

      if (!user) {
        return res
          .status(404)
          .json({ status: 404, message: "l'utilisateur n'existe pas" });
      }

      const isMatch = await verifyPassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "l'email ou le mot de passe est incorrect",
          status: "KO",
        });
      }
      // Génère un code de vérification
      const codeVerification = this.generateVerificationCode(); // Appelle la méthode pour générer le code
      console.log("Code de vérification généré:", codeVerification);

      await prisma.user.update({
        where: { telephone },
        data: { code_verification: codeVerification },
      });

      return res.status(200).json({
        status: 200,
        data: { id: user.id, telephone: user.telephone, codeVerification },
        message: "Un code de verification a ete envoye",
      });
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return res.status(500).json({ status: 500, message: "Erreur serveur" });
    }
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyCode(req: Request, res: Response) {
    const { code_verification } = req.body;

    console.log("Code de vérification reçu:", code_verification);

    try {
      // Rechercher l'utilisateur en fonction du code de vérification
      const user = await prisma.user.findUnique({
        where: { code_verification },
      });

      if (!user) {
        return res
          .status(401)
          .json({ status: 401, message: "Code de vérification incorrect" });
      }

      // Génération du token JWT
      const token = jwt.sign(
        { id: user.id, telephone: user.telephone, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        status: 200,
        data: { token },
        message: "Vérification réussie",
      });
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      return res.status(500).json({ status: 500, message: "Erreur serveur" });
    }
  }

}

export default new AuthController();
