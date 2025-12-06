/*
  Warnings:

  - A unique constraint covering the columns `[role_id,permission_id]` on the table `RolePermission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,role_id]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_id_permission_id_key" ON "RolePermission"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_id_key" ON "UserRole"("user_id", "role_id");
