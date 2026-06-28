import "dotenv/config";
import { hash } from "bcryptjs";
import * as readline from "node:readline/promises";
import { prisma } from '../src/lib/prisma';

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Create Super Admin Account");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const name = await rl.question("Name: ");
  const email = (await rl.question("Email: ")).toLowerCase().trim();
  const password = await rl.question("Password (min 8 chars): ");

  rl.close();

  if (!name || !email || !password) {
    console.error("\n❌ All fields required");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("\n❌ Password must be at least 8 characters");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`\n❌ User with email ${email} already exists`);
    process.exit(1);
  }

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
      accountStatus: "APPROVED",
      emailVerified: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      accountStatus: true,
    },
  });

  console.log("\n✅ Super admin created:");
  console.log(`   Name:   ${user.name}`);
  console.log(`   Email:  ${user.email}`);
  console.log(`   Role:   ${user.role}`);
  console.log(`   Status: ${user.accountStatus}`);
  console.log("\nYou can now sign in with these credentials.\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
