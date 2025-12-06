import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("🧹 Clearing existing data...");

  // Delete in correct order to respect foreign key constraints
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  console.log("✅ Database cleared");
}

async function main() {
  try {
    // Clear existing data (optional - remove if you don't want to clear)
    await clearDatabase();

    // Run seed
    await import("./seeds/index");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
