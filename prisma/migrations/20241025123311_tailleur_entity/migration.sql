/*
  Warnings:

  - Added the required column `type_fournisseur` to the `fournisseurs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pays_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plafond` to the `wallets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_frais_id_fkey`;

-- AlterTable
ALTER TABLE `fournisseurs` ADD COLUMN `type_fournisseur` ENUM('facture', 'restaurant') NOT NULL;

-- AlterTable
ALTER TABLE `transactions` MODIFY `frais_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `pays_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `wallets` ADD COLUMN `plafond` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Pays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `indicatif` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Agence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `longitude` DOUBLE NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `Agence_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribe_fournisseurs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(191) NOT NULL,
    `fournisseur_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscribe_fournisseurs_fournisseur_id_key`(`fournisseur_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_pays_id_fkey` FOREIGN KEY (`pays_id`) REFERENCES `Pays`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agence` ADD CONSTRAINT `Agence_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_frais_id_fkey` FOREIGN KEY (`frais_id`) REFERENCES `frais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscribe_fournisseurs` ADD CONSTRAINT `subscribe_fournisseurs_fournisseur_id_fkey` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
