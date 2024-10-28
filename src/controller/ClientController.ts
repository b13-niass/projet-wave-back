
import { PrismaClient, TypeTransaction, StatutTransaction, User } from "@prisma/client";
import { Request, Response } from "express";
import { io } from "../app.js";
import { log } from "console";
import { hashPassword } from "../utils/password.js";
import { ControllerRequest, AuthenticatedRequest } from "../interface/Interface.js";
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


  async transfert(req: ControllerRequest, res: Response): Promise<Response> {

    const userId = req.id!; // Assurez-vous que req.id est défini
    console.log(req.id);

    try {
      const contacts = await prisma.contact.findMany({
        where: { user_id: userId },
      });

      if (contacts.length === 0) {
        return res.status(404).json({
          message: "Aucun contact trouvé.",
          status: "KO",
        });
      }

      // Renvoyer une réponse avec des contacts
      return res.status(200).json({
        data: contacts,
        message: "Liste de contacts chargée.",
        status: "OK",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message, status: "KO" });
      }
      return res.status(500).json({ message: "Erreur inconnue", status: "KO" });
    }
  }

  async addContact(req: ControllerRequest, res: Response) {
    try {
      const { nom, telephone } = req.body;
      const user_id = req.id!; // Supposons que l'ID de l'utilisateur est stocké dans `req.user`

      // Validation des champs
      if (!nom || !telephone) {
        return res.status(400).json({
          message: "Le nom et le numéro de téléphone sont requis.",
          status: "KO",
        });
      }

      // Ajout du contact à la base de données
      const contact = await prisma.contact.create({
        data: {
          nom,
          telephone,
          user_id,
        },
      });

      res.status(201).json({
        message: "Contact ajouté avec succès",
        contact,


  async getAllAgence(req: ControllerRequest, res: Response) {
    const idUser = parseInt(req.id as string, 10);
    try {
      const user = await prisma.user.findUnique({ where: { id: idUser } });
      if (!user) {
        return res
          .status(404)
          .json({ data: [], message: "Utilisateur non trouvé", status: "KO" });
      }
      const agences = await prisma.agence.findMany();
      res.json({
        data: [
          {
            user,
            agences,
          },
        ],
        message: "Liste des agences récupérées avec succès",
        status: "OK",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ data: [], message: "Internal Server Error", status: "KO" });
    }
  }

  async getUserPlafond(req: ControllerRequest, res: Response) {
    const idUser = parseInt(req.id as string, 10);
    try {
      const user = await prisma.user.findUnique({ where: { id: idUser } });
      if (!user) {
        return res
          .status(404)
          .json({ data: [], message: "Utilisateur non trouvé", status: "KO" });
      }
      const wallet = await prisma.wallet.findFirst({
        where: { user_id: idUser },
      });
      res.json({
        data: [
          {
            user,
            wallet,
          },
        ],
        message: "Plafond récupéré avec succès",
        status: "OK",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ data: [], message: "Internal Server Error", status: "KO" });
    }
  }

  async changePassword(req: ControllerRequest, res: Response) {
    const idUser = parseInt(req.id as string, 10);
    let { password } = req.body;
    try {
      let user = await prisma.user.findUnique({ where: { id: idUser } });
      if (!user) {
        return res
          .status(404)
          .json({ data: [], message: "Utilisateur non trouvé", status: "KO" });
      }

      password = await hashPassword(password);

      user = await prisma.user.update({
        where: { id: idUser },
        data: { password },
      });
      delete (user as Partial<User>).password;

      res.json({
        data: [
          {
            user,
          },
        ],
        message: "Mot de passe modifié avec succès",

        status: "OK",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({ message: "Erreur lors de l'ajout du contact", error });
    }
  }


  async transfer(req: ControllerRequest, res: Response) {
    try {
      const { montant_envoye, montant_recus, contact_id } = req.body; // Récupération des montants et de l'identifiant du contact
      const userId = req.id!; // Récupérer l'ID de l'utilisateur connecté

      // Validation des champs
      if (!montant_envoye && !montant_recus) {
        return res.status(400).json({
          message: "Vous devez fournir soit le montant à envoyer soit le montant à recevoir.",
          status: "KO",
        });
      }

      // Vérification du portefeuille de l'utilisateur
      const wallet = await prisma.wallet.findUnique({
        where: { user_id: userId },
      });

      // Déterminer le montant à envoyer et à recevoir
      let montantEnvoye = montant_envoye || ((montant_recus / (1 - 0.01))); // 1% de frais
      let montantRecus = montant_recus || (montantEnvoye * (1 - 0.01)); // 1% de frais

      if (!wallet || wallet.solde < montantEnvoye) {
        return res.status(400).json({
          message: "Solde insuffisant.",
          status: "KO",
        });
      }

      // Rechercher le contact par ID
      const contact = await prisma.contact.findUnique({
        where: { id: contact_id },
      });

      if (!contact) {
        return res.status(404).json({
          message: "Contact non trouvé.",
          status: "KO",
        });
      }

      // Créer la transaction
      const transaction = await prisma.transaction.create({
        data: {
          sender_id: userId,
          receiver_id: contact.user_id,
          montant_envoye: montantEnvoye,
          montant_recus: montantRecus,
          type_transaction: TypeTransaction.transfert, // Utilisation de l'énumération pour le type
          statut: StatutTransaction.effectuer, // Statut initial de la transaction
        },
      });

      // Mettre à jour le solde du portefeuille
      await prisma.wallet.update({
        where: { user_id: userId },
        data: { solde: wallet.solde - montantEnvoye },
      });

      // Émettre une notification de transfert au destinataire via Socket.IO
      io.to(`user_${contact.user_id}`).emit("notificationTransfert", {
        senderId: userId,
        receiverId: contact.user_id,
        montant: montantRecus,
        message: "Vous avez reçu un transfert.",
      });

      res.status(201).json({
        data: transaction,
        message: "Transfert effectué avec succès.",
        status: "OK",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors du transfert", error });
    }
  }


      res
        .status(500)
        .json({ data: [], message: "Internal Server Error", status: "KO" });
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

