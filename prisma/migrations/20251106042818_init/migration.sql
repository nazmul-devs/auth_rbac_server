/*
  Warnings:

  - A unique constraint covering the columns `[token_hash]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "device_id" TEXT,
ADD COLUMN     "device_name" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "two_fa_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_hash_key" ON "RefreshToken"("token_hash");
