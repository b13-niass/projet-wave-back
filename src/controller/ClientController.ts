import {
  PrismaClient,
  TypeTransaction,
  StatutTransaction,
  User,
} from "@prisma/client";
import { Response } from "express";
import { io } from "../app.js";
import { hashPassword } from "../utils/password.js";
import {
  ControllerRequest,
  AuthenticatedRequest,
} from "../interface/Interface.js";
// import { TypeTransaction } from "../enums/TypeTransaction.js";
// import { StatutTransaction } from "../enums/StatutTransaction.js"; // Chemin à ajuster

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

  // async transfert(req: ControllerRequest, res: Response): Promise<Response> {
  //   const userId = parseInt(req.id!); // Assurez-vous que req.id est défini
  //   console.log(req.id);

  //   try {
  //     const contacts = await prisma.contact.findMany({
  //       where: { user_id: userId },
  //     });

  //     if (contacts.length === 0) {
  //       return res.status(404).json({
  //         message: "Aucun contact trouvé.",
  //         status: "KO",
  //       });
  //     }

  //     // Renvoyer une réponse avec des contacts
  //     return res.status(200).json({
  //       data: contacts,
  //       message: "Liste de contacts chargée.",
  //       status: "OK",
  //     });
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       return res.status(500).json({ message: error.message, status: "KO" });
  //     }
  //     return res.status(500).json({ message: "Erreur inconnue", status: "KO" });
  //   }
  // }

  async addContact(req: ControllerRequest, res: Response) {
    try {
      const { nom, telephone } = req.body;
      const user_id = parseInt(req.id!); // Supposons que l'ID de l'utilisateur est stocké dans req.user

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
        status: "OK",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Erreur lors de l'ajout du contact", error });
    }
  }

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

      res
        .status(500)
        .json({ message: "Erreur lors de l'ajout du contact", error });
    }
  }

  async transfert(req: ControllerRequest, res: Response) {
    try {
      const { montant_recus, telephone } = req.body;
      const userId = parseInt(req.id!);

      // Validation des champs
      if (!montant_recus && !telephone) {
        return res.status(400).json({
          message:
            "Vous devez fournir soit le montant à envoyer soit le montant à recevoir.",
          status: "KO",
        });
      }

      const userReceiver = await prisma.user.findUnique({
        where: { telephone },
      });

      if (!userReceiver) {
        return res.status(404).json({
          message: "Utilisateur non trouvé.",
          status: "KO",
        });
      }

      // Vérification du portefeuille de l'utilisateur
      const wallet = await prisma.wallet.findUnique({
        where: { user_id: userId },
      });

      const frais = await prisma.frais.findFirst();

      const montantEnvoye = montant_recus + montant_recus * frais!.valeur;

      if (!wallet || wallet.solde < montantEnvoye) {
        return res.status(400).json({
          message: "Solde insuffisant.",
          status: "KO",
        });
      }

      // Créer la transaction
      const transaction = await prisma.transaction.create({
        data: {
          sender_id: userId,
          receiver_id: userReceiver.id,
          montant_envoye: montantEnvoye,
          montant_recus: montant_recus,
          type_transaction: TypeTransaction.transfert,
          statut: StatutTransaction.effectuer,
        },
      });

      // Mettre à jour le solde du portefeuille
      await prisma.wallet.update({
        where: { user_id: userId },
        data: { solde: wallet.solde - montantEnvoye },
      });

      // Mise à jour du portefeuille
      await prisma.wallet.update({
        where: { user_id: userReceiver.id },
        data: {
          solde: { increment: montant_recus },
        },
      });

      // // Émettre une notification de transfert au destinataire via Socket.IO
      // io.to(`user_${contact.user_id}`).emit("notificationTransfert", {
      //   senderId: userId,
      //   receiverId: contact.user_id,
      //   montant: montantRecus,
      //   message: "Vous avez reçu un transfert.",
      // });

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
    const idUser = parseInt(req.id!); // Récupérer l'ID de l'utilisateur connecté
    const { id_banque } = req.params; // Récupérer l'id de la banque depuis les paramètres de la requête

    try {
      const banque = await prisma.banque.findUnique({
        where: { id: Number(id_banque) }, // S'assurer que l'id est un nombre
        include: {
          userBanques: {
            where: { user_id: idUser },
          },
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
  async createBanque(req: ControllerRequest, res: Response): Promise<void> {
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
      const fournisseurs = await prisma.fournisseur.findMany();
      res.status(200).json(fournisseurs);
    } catch (error) {
      console.error("Error fetching fournisseurs:", error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching fournisseurs." });
    }
  }

  async addPaiement(req: ControllerRequest, res: Response) {
    const userId = parseInt(req.id!);
    const { fournisseurId, typeFournisseur, referentiel, montant } = req.body;

    if (!fournisseurId || !montant || !typeFournisseur) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    try {
      const fournisseur = await prisma.fournisseur.findUnique({
        where: { id: parseInt(fournisseurId) },
        include: {
          user: true,
        },
      });

      if (typeFournisseur === "facture") {
        if (!referentiel) {
          return res.status(400).json({
            message: "Referentiel is required for TypeFournisseur 'facture'",
          });
        }

        const subF = await prisma.subscribeFournisseur.findFirst({
          where: {
            reference: referentiel,
          },
        });

        if (!subF) {
          res
            .status(404)
            .json({ message: "Ce referentiel n'existe pas", status: "KO" });
        }
      }

      const wallet = await prisma.wallet.findUnique({
        where: {
          user_id: userId,
        },
      });

      if (!wallet) {
        return res
          .status(404)
          .json({ message: "Wallet not found", status: "KO" });
      }

      if (wallet.solde < montant) {
        return res
          .status(400)
          .json({ message: "Insufficient funds", status: "KO" });
      }
      await prisma.transaction.create({
        data: {
          sender_id: userId,
          montant_envoye: montant,
          montant_recus: montant,
          type_transaction: "paiement",
          statut: "effectuer",
          receiver_id: fournisseur?.user.id!,
        },
      });

      const updatedWallet = await prisma.wallet.update({
        where: {
          user_id: userId,
        },
        data: {
          solde: wallet.solde - montant,
        },
      });

      res
        .status(201)
        .json({ message: "Payment processed successfully", montant });
    } catch (error) {
      console.error("Error processing payment:", error);
      res
        .status(500)
        .json({ message: "An error occurred while processing the payment" });
    }
  }

  async getAccueil(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.id) {
        return res
          .status(400)
          .json({ message: "ID utilisateur manquant", status: "ERROR" });
      }

      const userId = parseInt(req.id, 10);

      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "ID utilisateur invalide", status: "ERROR" });
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

  async creditTransaction(req: ControllerRequest, res: Response) {
    try {
      // Vérification de l'authentification
      if (!req.id) {
        return res.status(401).json({
          status: "error",
          message: "Utilisateur non authentifié",
          data: null,
        });
      }

      const { nom_contact, telephone_contact, montant } = req.body;
      const user_id = parseInt(req.id); // Assurer que user_id est un entier

      // Validation des champs requis
      if (!nom_contact || !telephone_contact || !montant) {
        return res.status(400).json({
          status: "Ko",
          message: "Tous les champs sont requis",
          data: null,
        });
      }

      // Vérification du solde du portefeuille
      const wallet = await prisma.wallet.findUnique({
        where: { user_id: user_id },
      });

      if (!wallet || wallet.solde < montant) {
        return res.status(400).json({
          status: "Ko",
          message: "Solde insuffisant pour effectuer cette transaction",
          data: null,
        });
      }

      // Exécution de la transaction
      const transaction = await prisma.$transaction(async (prisma) => {
        // Création de la transaction
        const newTransaction = await prisma.transaction.create({
          data: {
            sender_id: user_id,
            receiver_id: user_id,
            montant_envoye: montant,
            montant_recus: montant,
            type_transaction: "recharge_credit",
            statut: "effectuer",
          },
        });

        // Mise à jour du portefeuille
        await prisma.wallet.update({
          where: { user_id: user_id },
          data: {
            solde: { decrement: montant },
          },
        });

        // Création ou mise à jour du contact
        await prisma.contact.create({
          data: {
            nom: nom_contact,
            telephone: telephone_contact,
            user_id: user_id,
          },
        });

        // Création de la notification
        await prisma.notification.create({
          data: {
            notifier_id: user_id,
            notified_id: user_id,
            titre: "Achat de crédit",
            message: `Achat de crédit de ${montant} FCFA pour le numéro ${telephone_contact}`,
            transaction_id: newTransaction.id,
          },
        });

        return newTransaction;
      });

      // Émission de l'événement WebSocket
      io.emit("newTransaction", {
        type: "recharge_credit",
        data: transaction,
      });

      return res.status(201).json({
        status: "success",
        message: `Recharge de crédit de ${montant} FCFA effectuée avec succès`,
        data: transaction,
      });
    } catch (error) {
      console.error("Erreur lors de la transaction de crédit:", error);
      return res.status(500).json({
        status: "Ko",
        message: "Erreur lors de la création de la transaction",
        data: null,
      });
    }
  }

  async getContacts(req: ControllerRequest, res: Response) {
    try {
      // Vérification de l'authentification
      if (!req.id) {
        return res.status(401).json({
          status: "error",
          message: "Utilisateur non authentifié",
          data: null,
        });
      }

      const user_id = parseInt(req.id);

      const contacts = await prisma.contact.findMany({
        where: { user_id: user_id },
      });

      return res.status(200).json({
        status: "success",
        message: "Contacts récupérés avec succès",
        data: contacts,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des contacts:", error);
      return res.status(500).json({
        status: "error",
        message: "Erreur lors de la récupération des contacts",
        data: null,
      });
    }
  }
}

export default new ClientController();
