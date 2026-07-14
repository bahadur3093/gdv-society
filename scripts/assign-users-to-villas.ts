import prisma from "../src/lib/prisma";
import "dotenv/config";

async function main() {
  console.log("DATABASE_URL =", process.env.DATABASE_URL);
  console.log("Starting migration...");

  const villas = await prisma.villa.findMany({
    where: {
      userId: null,
      isBillable: true,
    },
    select: {
      villaNo: true,
      ownerName: true,
      userId: true,
      id: true,
    },
  });

  console.log('Villas', villas)

}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
