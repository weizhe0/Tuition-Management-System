
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function addDemoStudent(formData: FormData) {
  "use server";

  // This action is for local development only.
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Student creation is disabled.");
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing.");
  }

  const databaseUrl = new URL(connectionString);

  const isLocalDatabase =
    ["localhost", "127.0.0.1"].includes(databaseUrl.hostname) &&
    databaseUrl.pathname === "/tuition_management_v2" &&
    databaseUrl.username === "tuition_app";

  if (!isLocalDatabase) {
    throw new Error("Only the local demo database is allowed.");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const monthlyFee = String(
    formData.get("monthlyFee") ?? ""
  ).trim();

  const validEmail = /^[^\s@]+@[^\s@]+\.test$/.test(email);
  const validFee = /^\d{1,5}(?:\.\d{1,2})?$/.test(monthlyFee);

  if (
    !fullName ||
    fullName.length > 100 ||
    !validEmail ||
    !validFee
  ) {
    redirect("/staff/students/new?error=invalid");
  }

  // Convert RM to integer sen without floating-point calculations.
  const [ringgit, cents = ""] = monthlyFee.split(".");

  const monthlyFeeSen =
    Number(ringgit) * 100 +
    Number(cents.padEnd(2, "0"));

  const existingStudent = await prisma.student.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingStudent) {
    redirect("/staff/students/new?error=duplicate");
  }

  await prisma.student.create({
    data: {
      fullName,
      email,
      feePlan: {
        create: {
          monthlyFeeSen,
        },
      },
    },
  });

  revalidatePath("/staff/students");
  redirect("/staff/students");
}

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AddStudentPage({
  searchParams,
}: PageProps) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/staff/students"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Student List
        </Link>

        <section className="mt-6 rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">
            Add Student / 新增学生
          </h1>

          <p className="mt-2 text-sm text-amber-700">
            Development-only form. Use fictional demo data.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error === "duplicate"
                ? "This demo email already exists."
                : "Please check the name, demo email and fee."}
            </p>
          )}

          <form action={addDemoStudent} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block font-medium"
              >
                Student Name / 学生姓名
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                maxLength={100}
                placeholder="Jason Lee (Demo)"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-medium"
              >
                Demo Email / 测试邮箱
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jason.demo@example.test"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
              <p className="mt-1 text-xs text-slate-500">
                Only .test email addresses are allowed.
              </p>
            </div>

            <div>
              <label
                htmlFor="monthlyFee"
                className="mb-2 block font-medium"
              >
                Monthly Fee (RM) / 每月学费
              </label>

              <input
                id="monthlyFee"
                name="monthlyFee"
                type="text"
                inputMode="decimal"
                required
                placeholder="250.00"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Demo Student / 保存测试学生
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
