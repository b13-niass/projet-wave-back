-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'client', 'agence', 'fournisseur');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('depot', 'retrait', 'transfert', 'paiement', 'recharge_credit');

-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('effectuer', 'annuler');

-- CreateEnum
CREATE TYPE "EtatUserBanque" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('banque', 'fournisseur');

-- CreateEnum
CREATE TYPE "TypeFournisseur" AS ENUM ('facture', 'restaurant');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "file_cni" TEXT NOT NULL,
    "cni" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "code_verification" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "statut_compte" TEXT NOT NULL,
    "qrcode" TEXT,
    "pays_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pays" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "indicatif" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agence" (
    "id" SERIAL NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Agence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "montant_envoye" DOUBLE PRECISION NOT NULL,
    "montant_recus" DOUBLE PRECISION NOT NULL,
    "type_transaction" "TypeTransaction" NOT NULL,
    "statut" "StatutTransaction" NOT NULL,
    "frais_id" INTEGER,
    "receiver_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frais" (
    "id" SERIAL NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plafond" INTEGER NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "notifier_id" INTEGER NOT NULL,
    "notified_id" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transaction_id" INTEGER NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type_fournisseur" "TypeFournisseur" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pourcentage" DOUBLE PRECISION NOT NULL,
    "type" "TypeContrat" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribe_fournisseurs" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "fournisseur_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscribe_fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats_fournisseur" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "fournisseur_id" INTEGER NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "id_type_contrat" INTEGER NOT NULL,

    CONSTRAINT "contrats_fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats_banques" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "banque_id" INTEGER NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "id_type_contrat" INTEGER NOT NULL,

    CONSTRAINT "contrats_banques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banques" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_banques" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "banque_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "etat" "EtatUserBanque" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_banques_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agence_user_id_key" ON "Agence"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_transaction_id_key" ON "notifications"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "fournisseurs_user_id_key" ON "fournisseurs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscribe_fournisseurs_fournisseur_id_key" ON "subscribe_fournisseurs"("fournisseur_id");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_transaction_id_key" ON "paiements"("transaction_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pays_id_fkey" FOREIGN KEY ("pays_id") REFERENCES "Pays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agence" ADD CONSTRAINT "Agence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_frais_id_fkey" FOREIGN KEY ("frais_id") REFERENCES "frais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_notifier_id_fkey" FOREIGN KEY ("notifier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_notified_id_fkey" FOREIGN KEY ("notified_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fournisseurs" ADD CONSTRAINT "fournisseurs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscribe_fournisseurs" ADD CONSTRAINT "subscribe_fournisseurs_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats_fournisseur" ADD CONSTRAINT "contrats_fournisseur_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats_fournisseur" ADD CONSTRAINT "contrats_fournisseur_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats_fournisseur" ADD CONSTRAINT "contrats_fournisseur_id_type_contrat_fkey" FOREIGN KEY ("id_type_contrat") REFERENCES "contrats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats_banques" ADD CONSTRAINT "contrats_banques_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats_banques" ADD CONSTRAINT "contrats_banques_banque_id_fkey" FOREIGN KEY ("banque_id") REFERENCES "banques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats_banques" ADD CONSTRAINT "contrats_banques_id_type_contrat_fkey" FOREIGN KEY ("id_type_contrat") REFERENCES "contrats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_banques" ADD CONSTRAINT "user_banques_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_banques" ADD CONSTRAINT "user_banques_banque_id_fkey" FOREIGN KEY ("banque_id") REFERENCES "banques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
