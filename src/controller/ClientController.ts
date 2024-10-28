import { PrismaClient } from "@prisma/client";
import { ControllerRequest, AuthenticatedRequest } from "../interface/Interface.js";
import { Response } from "express";
import { TypeTransaction } from "../enums/TypeTransaction.js";
import { StatutTransaction } from "../enums/StatutTransaction.js"; // Chemin à ajuster





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

  // Method to get all fournisseurs
  async getFournisseurs(req: ControllerRequest, res: Response) {
    try {
      const fournisseurs = await prisma.fournisseur.findMany({
        select: {
          logo: true,
          libelle: true,
        },
      });
      res.status(200).json(fournisseurs);
    } catch (error) {
      console.error("Error fetching fournisseurs:", error);
      res.status(500).json({ message: "An error occurred while fetching fournisseurs." });
    }
  }
  
  async addPaiement(req: ControllerRequest, res: Response) {
    const { fournisseurId, typeFournisseur, referentiel, montant } = req.body;
  
    console.log("Request body:", req.body); // Vérifiez les données d'entrée
  
    if (!fournisseurId || !montant || !typeFournisseur) {
      return res.status(400).json({ message: "Invalid request body" });
    }
  
    try {
      const frais = await prisma.frais.findFirst();
      console.log("Frais structure:", frais); // Vérifiez la structure des frais
  
      if (!frais) {
        return res.status(500).json({ message: "Fee structure not found" });
      }
  
      // Calcul du montant reçu
      let montantRecus = montant;
      if (montant > 10) {
        montantRecus = montant - Math.floor((montant - 10) / 5) * 5;
      }
  
      // Si `TypeFournisseur` est `facture`, vérifiez et ajoutez à SubscribeFournisseur
      if (typeFournisseur === "facture") {
        if (!referentiel) {
          return res.status(400).json({ message: "Referentiel is required for TypeFournisseur 'facture'" });
        }
  
        // Vérifiez si un enregistrement existe déjà
        const existingSubscribe = await prisma.subscribeFournisseur.findFirst({
          where: { fournisseur_id: fournisseurId, reference: referentiel },
        });
  
        // Si aucun enregistrement n'existe, créez un nouveau
        if (!existingSubscribe) {
          await prisma.subscribeFournisseur.create({
            data: {
              reference: referentiel,
              fournisseur_id: fournisseurId,
            },
          });
        } else {
          console.log("Un abonnement existe déjà pour ce fournisseur avec ce référentiel.");
        }
      }
  
      // Créez l'enregistrement de transaction
      await prisma.transaction.create({
        data: {
          sender_id: null, // Modifiez ici pour permettre des paiements sans connexion
          montant_envoye: montant,
          montant_recus: montantRecus,
          type_transaction: "paiement", // Remplacez par l'énumération si nécessaire
          statut: "effectuer", // Remplacez par l'énumération si nécessaire
          receiver_id: fournisseurId,
          frais_id: frais.id,
        },
      });
  
      res.status(201).json({ message: "Payment processed successfully", montantRecus });
    } catch (error) {
      console.error("Error processing payment:", error); // Affichez l'erreur pour le débogage
      res.status(500).json({ message: "An error occurred while processing the payment" });
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

