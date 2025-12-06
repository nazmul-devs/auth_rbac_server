import { PrismaClient } from "@prisma/client";
import { permissions } from "./data/permissions";
import { roles } from "./data/roles";
import { users } from "./data/users";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create Permissions
  console.log("📝 Creating permissions...");
  for (const permissionData of permissions) {
    await prisma.permission.upsert({
      where: { name: permissionData.name },
      update: {},
      create: permissionData,
    });
  }
  console.log("✅ Permissions created");

  // 2. Create Roles and link Permissions
  console.log("👥 Creating roles...");
  for (const roleData of roles) {
    const { permissions: permissionNames, ...roleInfo } = roleData;

    const role = await prisma.role.upsert({
      where: { name: roleInfo.name },
      update: {},
      create: roleInfo,
    });

    // Link permissions to role
    for (const permissionName of permissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: permission.id,
            },
          },
          update: {},
          create: {
            role_id: role.id,
            permission_id: permission.id,
          },
        });
      }
    }
  }
  console.log("✅ Roles created with permissions");

  // 3. Create Users and assign Roles
  console.log("👤 Creating users...");
  for (const userData of users) {
    const { roles: roleNames, ...userInfo } = userData;

    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: {},
      create: userInfo,
    });

    // Assign roles to user
    for (const roleName of roleNames) {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (role) {
        await prisma.userRole.upsert({
          where: {
            user_id_role_id: {
              user_id: user.id,
              role_id: role.id,
            },
          },
          update: {},
          create: {
            user_id: user.id,
            role_id: role.id,
          },
        });
      }
    }
  }
  console.log("✅ Users created with roles");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
