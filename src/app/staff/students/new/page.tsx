
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  requireRole,
  assertRole,
} from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Convert RM to sen without floating-point calculations.
function parseMonthlyFeeSen(value: string) {
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(value)) {
    return null;
  }

  const [ringgit, sen = ""] = value.split(".");
  const amount =
    Number(ringgit) * 100 +
    Number(sen.padEnd(2, "0"));

  if (
    !Number.isSafeInteger(amount) ||
    amount < 0 ||
    amount > 10_000_000
  ) {
    return null;
  }

  return amount;
}

export default async function NewStudentPage({
  searchParams,
}: PageProps) {
  // Protect the page itself.
  await requireRole("STAFF");

  const { error } = await searchParams;

  async function createStudent(formData: FormData) {
    "use server";

    // Protect the Server Action independently.
    await assertRole("STAFF");

    const fullName = getText(formData, "fullName");
    const emailText = getText(
      formData,
      "email"
    ).toLowerCase();
    const phoneText = getText(formData, "phone");

    const email = emailText || null;
    const phone = phoneText || null;

    const monthlyFeeSen = parseMonthlyFeeSen(
      getText(formData, "monthlyFee")
    );

    const emailValid =
      !email ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
      fullName.length < 2 ||
      fullName.length > 100 ||
      (email !== null && email.length > 254) ||
      !emailValid ||
      (phone !== null && phone.length > 40) ||
      monthlyFeeSen === null
    ) {
      redirect("/staff/students/new?error=invalid");
    }

    if (email) {
      const existing = await prisma.student.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existing) {
        redirect("/staff/students/new?error=duplicate");
      }
    }

    // Create Student and Fee Plan together.
    await prisma.student.create({
      data: {
        fullName,
        email,
        phone,
        isActive: true,
        feePlan: {
          create: {
            monthlyFeeSen,
          },
        },
      },
    });

    revalidatePath("/staff/students");
    revalidatePath("/staff");

    redirect("/staff/students?status=created");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold text-blue-700">
            STAFF PORTAL
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Add New Student
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create a student profile and monthly fee plan.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error === "duplicate"
                ? "A student with this email already exists."
                : "Please check the entered information."}
            </div>
          )}

          <form
            action={createStudent}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium"
              >
                Full Name *
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="Example: New Student (Demo)"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                maxLength={254}
                placeholder="student@example.test"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium"
              >
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                maxLength={40}
                placeholder="0123456789"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div>
              <label
                htmlFor="monthlyFee"
                className="mb-2 block text-sm font-medium"
              >
                Monthly Fee (RM) *
              </label>

              <input
                id="monthlyFee"
                name="monthlyFee"
                type="number"
                min="0"
                max="100000"
                step="0.01"
                defaultValue="300.00"
                required
                className="w-full rounded-lg border border-slate-300 p-3"
              />

              <p className="mt-2 text-xs text-slate-500">
                Example: 300.00 means RM 300.00.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Save Student
              </button>

              <Link
                href="/staff/students"
                className="rounded-lg border border-slate-300 px-6 py-3 font-medium hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>

          <p className="mt-6 text-xs text-amber-700">
            Creating a student profile does not automatically
            create a login account.
          </p>
        </div>
      </div>
    </main>
  );
}
