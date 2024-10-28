
import { PrismaClient, TypeTransaction, StatutTransaction } from "@prisma/client";
import { ControllerRequest } from "../interface/Interface.js";
import { Request, Response } from "express";
import { io } from "../app.js";
import { log } from "console";




// const socket = io("http://localhost:5000");

const prisma = new PrismaClient();

class ClientController {
  constructor() {
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

}

export default new ClientController();
