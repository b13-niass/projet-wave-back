import { PrismaClient } from "@prisma/client";
import { ControllerRequest } from "../interface/Interface.js"; // Assurez-vous que ce fichier exporte bien le type approprié
import { Response } from "express";

const prisma = new PrismaClient();

class ClientController {
  constructor() {
    // Lier toutes les méthodes de l'instance à `this`
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      const val = (this as any)[key];
      if (key !== "constructor" && typeof val === "function") {
        (this as any)[key] = val.bind(this);
      }
    }
  }

  // Définition de la méthode getAllBanques
  async getAllBanques(req: ControllerRequest, res: Response): Promise<void> {
    try {
      const banques = await prisma.banque.findMany({
        select: {
          id: true,
          libelle: true,
          logo: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.status(200).json({
        success: true,
        data: banques,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des banques :", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des banques.",
      });
    }
  }


  // Méthode pour obtenir une banque et ses utilisateurs associés
  async getBanqueById(req: ControllerRequest, res: Response): Promise<void> {
    const { id_banque } = req.params; // Récupérer l'id de la banque depuis les paramètres de la requête

    try {
      const banque = await prisma.banque.findUnique({
        where: { id: Number(id_banque) }, // S'assurer que l'id est un nombre
        include: {
          userBanques: true, // Inclure les utilisateurs associés
        },
      });

      if (!banque) {
        res.status(404).json({
          success: false,
          message: "Banque non trouvée.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { banque, user_banque: banque.userBanques },
        message: "Banque récupérée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de la banque :", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de la banque.",
      });
    }
  }

 // Méthode pour créer une nouvelle banque
 async createBanque(req:ControllerRequest, res: Response): Promise<void> {
  const { libelle, logo } = req.body; // Récupérer les données depuis le corps de la requête

  // Validation des données
  if (!libelle || !logo) {
    res.status(400).json({
      success: false,
      message: "Le libelle et le logo sont requis.",
    });
    return;
  }

  try {
    // Création de la banque
    const newBanque = await prisma.banque.create({
      data: {
        libelle,
        logo,
        // Vous pouvez ajouter d'autres champs si nécessaire
      },
    });

    res.status(201).json({
      success: true,
      data: newBanque,
      message: "Banque créée avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de la création de la banque :", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la banque.",
    });
  }
}



}

export default new ClientController();
