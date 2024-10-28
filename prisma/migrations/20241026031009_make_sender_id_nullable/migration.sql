-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_sender_id_fkey";

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "sender_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
