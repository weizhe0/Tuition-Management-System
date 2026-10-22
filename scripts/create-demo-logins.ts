
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const secret = process.env.BETTER_AUTH_SECRET;

if (!connectionString || !secret) {
  throw new Error("Database URL or auth secret is missing.");
}

const databaseUrl = new URL(connectionString);

const isSafeLocalDatabase =
  process.env.NODE_ENV !== "production" &&
  ["localhost", "127.0.0.1"].includes(databaseUrl.hostname) &&
  databaseUrl.port === "5432" &&
  databaseUrl.pathname === "/tuition_management_v2" &&
  databaseUrl.username === "tuition_app";

if (!isSafeLocalDatabase) {
  throw new Error("Only the local V2 demo database is allowed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// This instance is used ONLY by this local script.
// The real app still has public sign-up disabled.
const demoAuth = betterAuth({
  secret,
  baseURL: "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT",
        input: false,
      },
    },
  },
});

const demoAccounts = [
  {
    name: "Staff Admin (Demo)",
    email: "staff.demo@example.test",
    role: "STAFF",
  },
  {
    name: "Teacher Chen (Demo)",
    email: "teacher.demo@example.test",
    role: "TEACHER",
  },
  {
    name: "Ali Tan (Demo)",
    email: "ali.demo@example.test",
    role: "STUDENT",
  },
] as const;

async function main() {
  // Confirm the existing demo student is present first.
  const ali = await prisma.student.findUnique({
    where: { email: "ali.demo@example.test" },
  });

  if (!ali) {
    throw new Error("Ali Tan demo student was not found.");
  }

  for (const account of demoAccounts) {
    const existing = await prisma.user.findUnique({
      where: { email: account.email },
    });

    if (existing) {
      console.log(`${account.email}: already exists, skipped`);
      continue;
    }

    const password = randomBytes(18).toString("base64url");

    const result = await demoAuth.api.signUpEmail({
      body: {
        name: account.name,
        email: account.email,
        password,
      },
    });

    const userId = result.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { role: account.role },
    });

    if (account.role === "TEACHER") {
      await prisma.teacher.create({
        data: {
          fullName: account.name,
          email: account.email,
          userId,
        },
      });
    }

    if (account.role === "STUDENT") {
      await prisma.student.update({
        where: { id: ali.id },
        data: { userId },
      });
    }

    console.log(`Created ${account.role}: ${account.email}`);
    console.log(`Password: ${password}`);
    console.log("------------------------------");
  }

  console.log("Demo account setup completed.");
}

main()
  .catch((error) => {
    console.error("Demo setup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
