
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, assertRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseMonthlyFeeSen(value: string) {
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(value)) {
    return null;
  }

  const [ringgit, cents = ""] = value.split(".");

  const amount =
    Number(ringgit) * 100 +
    Number(cents.padEnd(2, "0"));

  if (
    !Number.isSafeInteger(amount) ||
    amount < 0 ||
    amount > 10_000_000
  ) {
    return null;
  }

  return amount;
}

export default async function EditStudentPage({
  params,
  searchParams,
}: PageProps) {
  // IMPORTANT:
  // This must run INSIDE the page function,
  // not at the top level of this file.
  await requireRole("STAFF");

  const { id } = await params;
  const { error } = await searchParams;

  // Load the student only after authorization.
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      feePlan: true,
    },
  });

  if (!student) {
    notFound();
  }

  async function updateStudent(formData: FormData) {
    "use server";

    // Server Actions require their own authorization check.
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

    const validEmail =
      !email ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
      fullName.length < 2 ||
      fullName.length > 100 ||
      (email !== null && email.length > 254) ||
      !validEmail ||
      (phone !== null && phone.length > 40) ||
      monthlyFeeSen === null
    ) {
      redirect(
        `/staff/students/${id}/edit?error=invalid`
      );
    }

    if (email) {
      const duplicate = await prisma.student.findUnique({
        where: { email },
        select: { id: true },
      });

      if (duplicate && duplicate.id !== id) {
        redirect(
          `/staff/students/${id}/edit?error=duplicate`
        );
      }
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingStudent) {
      notFound();
    }

    await prisma.student.update({
      where: { id },
      data: {
        fullName,
        email,
        phone,
        feePlan: {
          upsert: {
            create: {
              monthlyFeeSen,
            },
            update: {
              monthlyFeeSen,
            },
          },
        },
      },
    });

    revalidatePath("/staff");
    revalidatePath("/staff/students");
    revalidatePath("/student");
    revalidatePath("/teacher");

    redirect("/staff/students?status=updated");
  }

  const monthlyFee = student.feePlan
    ? (student.feePlan.monthlyFeeSen / 100).toFixed(2)
    : "0.00";

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold text-blue-700">
            STAFF PORTAL
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Edit Student
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Update student information and monthly fee.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error === "duplicate"
                ? "Another student already uses this email."
                : "Please check the entered information."}
            </div>
          )}

          <form
            action={updateStudent}
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
                defaultValue={student.fullName}
                required
                minLength={2}
                maxLength={100}
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
                defaultValue={student.email ?? ""}
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
                defaultValue={student.phone ?? ""}
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
                required
                defaultValue={monthlyFee}
                className="w-full rounded-lg border border-slate-300 p-3"
              />

              <p className="mt-2 text-xs text-slate-500">
                Example: 280.00 means RM 280.00.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                Status:{" "}
                {student.isActive ? "Active" : "Inactive"}
              </p>

              <p className="mt-2">
                Login Account:{" "}
                {student.userId ? "Linked" : "Not Linked"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Save Changes
              </button>

              <Link
                href="/staff/students"
                className="rounded-lg border border-slate-300 px-6 py-3 font-medium hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>

          <p className="mt-6 text-xs text-slate-500">
            Editing this profile does not change
            the linked Better Auth login credentials.
          </p>
        </div>
      </div>
    </main>
  );
}
