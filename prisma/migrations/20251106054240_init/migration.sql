/*
  Warnings:

  - You are about to drop the column `is_active` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'DELETED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_active",
DROP COLUMN "is_verified",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING';
