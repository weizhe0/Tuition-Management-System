
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing.");
}

// Safety check: only allow our local development database.
const databaseUrl = new URL(connectionString);

const isLocal =
  databaseUrl.hostname === "localhost" ||
  databaseUrl.hostname === "127.0.0.1";

if (
  !isLocal ||
  databaseUrl.pathname !== "/tuition_management_v2" ||
  databaseUrl.username !== "tuition_app" ||
  process.env.NODE_ENV === "production"
) {
  throw new Error(
    "Seeding is only allowed for the local tuition_management_v2 database."
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const demoStudents = [
  {
    fullName: "Ali Tan (Demo)",
    email: "ali.demo@example.test",
    monthlyFeeSen: 30000,
  },
  {
    fullName: "Mei Ling (Demo)",
    email: "mei.demo@example.test",
    monthlyFeeSen: 18000,
  },
];

async function main() {
  for (const student of demoStudents) {
    const savedStudent = await prisma.student.upsert({
      where: {
        email: student.email,
      },
      update: {},
      create: {
        fullName: student.fullName,
        email: student.email,
        feePlan: {
          create: {
            monthlyFeeSen: student.monthlyFeeSen,
          },
        },
      },
      include: {
        feePlan: true,
      },
    });

    const fee = savedStudent.feePlan
      ? `RM ${(savedStudent.feePlan.monthlyFeeSen / 100).toFixed(2)}`
      : "Not set";

    console.log(`${savedStudent.fullName}: ${fee}`);
  }

  console.log("Demo student seeding completed.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
