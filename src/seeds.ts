import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


// dist/seeds.js
import 'dotenv/config';

// Votre code actuel suit ici


async function main() {
  // Seed Pays
  const pays1 = await prisma.pays.create({
    data: {
      nom: 'France',
      indicatif: '+33',
    },
  });

  const pays2 = await prisma.pays.create({
    data: {
      nom: 'Senegal',
      indicatif: '+221',
    },
  });

  const waveUser = await prisma.user.create({
    data: {
      nom: 'Wave',
      prenom: 'Mobile Money',
      password: 'secureWavePassword!789', // Ensure this password is hashed in production
      adresse: '456 Ocean Drive',
      telephone: '+221771234567',
      file_cni: 'wave_cni.pdf',
      cni: '9876543210',
      date_naissance: new Date('1985-06-20'),
      code_verification: 'GHI789',
      role: 'admin', // Adjust if different role is required
      statut_compte: 'active',
      pays: { connect: { id: pays1.id } }, // Assuming you have a pays object to connect to
    },
  });

  // Seed User
  const user1 = await prisma.user.create({
    data: {
      nom: 'Doe',
      prenom: 'John',
      password: 'password123',
      adresse: '123 Avenue',
      telephone: '+33612345678',
      file_cni: 'cni_doe.pdf',
      cni: '1234567890',
      date_naissance: new Date('1990-01-01'),
      code_verification: 'ABC123',
      role: 'client',
      statut_compte: 'active',
      pays_id: pays1.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      nom: 'Smith',
      prenom: 'Jane',
      password: 'password456',
      adresse: '456 Rue',
      telephone: '+221771234567',
      file_cni: 'cni_smith.pdf',
      cni: '9876543210',
      date_naissance: new Date('1985-05-15'),
      code_verification: 'XYZ789',
      role: 'agence',
      statut_compte: 'active',
      pays_id: pays2.id,
    },
  });

  const woyofalUser = await prisma.user.create({
    data: {
      nom: 'Woyofal',
      prenom: 'Electricity',
      password: 'securePassword!123', // Make sure the password is securely hashed if using in production
      adresse: '15 Rue du Soleil, Dakar',
      telephone: '+221771234567',
      file_cni: 'woyofal_cni.pdf',
      cni: '9876543210',
      date_naissance: new Date('1975-05-20'),
      code_verification: 'XYZ789',
      role: 'fournisseur',
      statut_compte: 'active',
      pays: { connect: { id: pays2.id } }, // Connect to existing country ID (Senegal)
    },
  });
  
  const woyofalFournisseur = await prisma.fournisseur.create({
    data: {
      libelle: 'Woyofal Electricity Provider',
      logo: 'https://example.com/woyofal_logo.png',
      type_fournisseur: 'facture', // You can also use 'restaurant' if appropriate
      user: { connect: { id: woyofalUser.id } }, // Connect the fournisseur to the created user
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed Wallet
  const wallet1 = await prisma.wallet.create({
    data: {
      user_id: user1.id,
      plafond: 2000000,
      solde: 500.50,
    },
  });

  const wallet2 = await prisma.wallet.create({
    data: {
      user_id: user2.id,
      plafond: 2000000,
      solde: 1500.75,
    },
  });

  // Seed Agence
  const agence1 = await prisma.agence.create({
    data: {
      user_id: user2.id,
      longitude: 2.3488,
      latitude: 48.8534,
    },
  });

  // Seed Transaction
  const transaction1 = await prisma.transaction.create({
    data: {
      sender_id: user2.id,
      receiver_id: user1.id,
      montant_envoye: 100.0,
      montant_recus: 98.0,
      type_transaction: 'depot',
      statut: 'effectuer',
    },
  });

  const transaction2 = await prisma.transaction.create({
    data: {
      sender_id: user1.id,
      receiver_id: user1.id,
      montant_envoye: 50.0,
      montant_recus: 50.0,
      type_transaction: 'recharge_credit',
      statut: 'effectuer',
    },
  });

  // Seed Frais
  const frais1 = await prisma.frais.create({
    data: {
      valeur: 0.01,
    },
  });

  // Seed Contact
  const contact1 = await prisma.contact.create({
    data: {
      nom: 'Mike Johnson',
      telephone: '+33687654321',
      user_id: user1.id,
    },
  });

  // Seed Notification
  const notification1 = await prisma.notification.create({
    data: {
      notifier_id: user2.id,
      notified_id: user1.id,
      titre: 'New Transaction',
      message: 'You have received 100 EUR.',
      transaction_id: transaction1.id,
    },
  });

  // Seed Contrat
  const contrat1 = await prisma.contrat.create({
    data: {
      libelle: 'Electricity Contract',
      description: 'Annual electricity provision.',
      pourcentage: 10.0,
      type: 'fournisseur',
    },
  });

  // Seed ContratFournisseur
  const contratFournisseur1 = await prisma.contratFournisseur.create({
    data: {
      user_id: waveUser.id,
      fournisseur_id: woyofalFournisseur.id,
      date_debut: new Date('2023-01-01'),
      date_fin: new Date('2024-01-01'),
      id_type_contrat: contrat1.id,
    },
  });

  // Seed ContratBanque
  const banque1 = await prisma.banque.create({
    data: {
      libelle: 'Bank XYZ',
      logo: 'logo_bankxyz.png',
    },
  });

  const contratBanque1 = await prisma.contratBanque.create({
    data: {
      user_id: waveUser.id,
      banque_id: banque1.id,
      date_debut: new Date('2023-06-01'),
      date_fin: new Date('2024-06-01'),
      id_type_contrat: contrat1.id,
    },
  });

  // Seed SubscribeFournisseur
  const subscribeFournisseur1 = await prisma.subscribeFournisseur.create({
    data: {
      reference: 'SUB123456',
      fournisseur_id: woyofalFournisseur.id,
    },
  });

   // Create Contrat
   const contrat = await prisma.contrat.create({
    data: {
      libelle: 'Contract Example',
      description: 'Description of contract example',
      pourcentage: 0.2,
      type: 'banque', // or 'fournisseur' depending on the type
    },
  })

  // Create Fournisseur
  const melloUser = await prisma.user.create({
    data: {
      nom: 'Mello',
      prenom: 'Gas Service',
      password: 'securePassword!456', // Remember to hash the password in production
      adresse: '22 Boulevard de la Liberté, Dakar',
      telephone: '+221778765432',
      file_cni: 'mello_cni.pdf',
      cni: '1122334455',
      date_naissance: new Date('1980-03-15'),
      code_verification: 'DEF456',
      role: 'fournisseur',
      statut_compte: 'active',
      pays: { connect: { id: pays1.id } }, // Assuming Senegal is already created and connected to pays1
    },
  });
  
  const melloFournisseur = await prisma.fournisseur.create({
    data: {
      libelle: 'Mello Gas Service Provider',
      logo: 'https://example.com/mello_logo.png',
      type_fournisseur: 'restaurant', // Or 'restaurant' depending on your model
      user: { connect: { id: melloUser.id } }, // Connect the fournisseur to the created user
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  

  // Create ContratFournisseur
  const contratFournisseur = await prisma.contratFournisseur.create({
    data: {
      user: { connect: { id: 1 } }, // Replace with an existing user ID
      fournisseur: { connect: { id: melloFournisseur.id } },
      date_debut: new Date(),
      date_fin: new Date('2025-06-15'),
      contrat: { connect: { id: contrat.id } },
    },
  })

  // Create ContratBanque
  const contratBanque = await prisma.contratBanque.create({
    data: {
      user: { connect: { id: 1 } }, // Replace with an existing user ID
      banque: {
        create: {
          libelle: 'Banque Example',
          logo: 'https://example.com/logo.png',
        }
      },
      date_debut: new Date(),
      date_fin: new Date('2025-06-15'),
      contrat: { connect: { id: contrat.id } },
    },
  })

  // Create Paiement
  const paiement = await prisma.paiement.create({
    data: {
      transaction: {
        create: {
          sender: { connect: { id: 1 } }, // Replace with an existing user ID
          receiver: { connect: { id: 2 } }, // Replace with an existing user ID
          montant_envoye: 100.0,
          montant_recus: 95.0,
          type_transaction: 'transfert',
          statut: 'effectuer',
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Create UserBanque
  const userBanque = await prisma.userBanque.create({
    data: {
      user: { connect: { id: user1.id } }, // Replace with an existing user ID
      banque: { connect: { id: banque1.id } }, // Replace with an existing banque ID
      code: 'BANK123',
      etat: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });