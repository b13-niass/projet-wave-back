/*
  Warnings:

  - You are about to drop the `Agence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pays` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agence" DROP CONSTRAINT "Agence_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_pays_id_fkey";

-- DropTable
DROP TABLE "Agence";

-- DropTable
DROP TABLE "Pays";

-- CreateTable
CREATE TABLE "pays" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "indicatif" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agences" (
    "id" SERIAL NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "agences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agences_user_id_key" ON "agences"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pays_id_fkey" FOREIGN KEY ("pays_id") REFERENCES "pays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agences" ADD CONSTRAINT "agences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
