


import { PrismaClient } from "@prisma/client";
import { ControllerRequest } from "../interface/Interface.js";
import { Response } from "express";
import { TypeTransaction } from "../enums/TypeTransaction.js";
import { StatutTransaction } from "../enums/StatutTransaction.js"; // Chemin à ajuster




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

// avec authentification

  // async addPaiement(req: ControllerRequest, res: Response) {
  //   const { fournisseurId, typeFournisseur, referentiel, montant } = req.body;

  //   if (!fournisseurId || !montant || !typeFournisseur) {
  //     return res.status(400).json({ message: "Invalid request body" });
  //   }

  //   try {
  //     // Check the fee rule
  //     const frais = await prisma.frais.findFirst();
  //     if (!frais) {
  //       return res.status(500).json({ message: "Fee structure not found" });
  //     }

  //     // Calculate the received amount based on the fee structure
  //     let montantRecus = montant;
  //     if (montant > 10) {
  //       montantRecus = montant - Math.floor((montant - 10) / 5) * 5;
  //     }

  //     // If `TypeFournisseur` is `facture`, add to SubscribeFournisseur
  //     if (typeFournisseur === "facture") {
  //       if (!referentiel) {
  //         return res.status(400).json({ message: "Referentiel is required for TypeFournisseur 'facture'" });
  //       }

  //       await prisma.subscribeFournisseur.create({
  //         data: {
  //           reference: referentiel,
  //           fournisseur_id: fournisseurId,
  //         },
  //       });
  //     }

  //     // Create the transaction record
  //     await prisma.transaction.create({
  //       data: {
  //         sender_id: req.user!.id, // assuming req.user.id is the authenticated user ID
  //         montant_envoye: montant,
  //         montant_recus: montantRecus,
  //         type_transaction: TypeTransaction.paiement,
  //         statut: StatutTransaction.effectuer, // Set as completed if no issues
  //         receiver_id: fournisseurId,
  //         frais_id: frais.id,
  //       },
  //     });

  //     res.status(201).json({ message: "Payment processed successfully", montantRecus });
  //   } catch (error) {
  //     console.error("Error processing payment:", error);
  //     res.status(500).json({ message: "An error occurred while processing the payment" });
  //   }
  // }



  

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
  
  
}

export default new ClientController();

