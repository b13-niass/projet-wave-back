import { PrismaClient } from "@prisma/client";
import { ControllerRequest, AuthenticatedRequest } from "../interface/Interface.js";
import { Response } from "express";

const prisma = new PrismaClient();

class ClientController {
  constructor() {
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this)) as (keyof this)[]) {
      const val = (this as any)[key];
      if (key !== "constructor" && typeof val === "function") {
        (this as any)[key] = val.bind(this);
      }
    }
  }

  // Méthode pour afficher la page d'accueil
  async getAccueil(req: AuthenticatedRequest, res: Response) {
    try {
      // Utiliser l'ID de l'utilisateur depuis le middleware d'authentification
      if (!req.id) {
        return res.status(400).json({ message: "ID utilisateur manquant", status: "ERROR" });
      }
  
      const userId = parseInt(req.id, 10);
      console.log("bbbbbbbbbbb", userId);
      // Vérification si userId est valide
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID utilisateur invalide", status: "ERROR" });
      }

      // Récupération des informations de l'utilisateur
      const user = await prisma.user.findUnique({
        where: {
          id: userId, // Utilisation de userId pour la recherche
        },
        include: {
          wallet: true,
          transactionsSent: true,
          transactionsReceived: true,
          userBanques: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "Utilisateur non trouvé",
          status: "ERROR",
        });
      }

      res.json({
        data: {
          user,
          transactions: [...user.transactionsSent, ...user.transactionsReceived],
          wallet: user.wallet,
          user_banque: user.userBanques,
        },
        message: "page d'accueil chargée",
        status: "OK",
      });
    } catch (error) {
      console.error("Erreur lors du chargement de la page d'accueil :", error);
      res.status(500).json({
        message: "Erreur serveur",
        status: "ERROR",
      });
    }
  }
}

export default new ClientController();
