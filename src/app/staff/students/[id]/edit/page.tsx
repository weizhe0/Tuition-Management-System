
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isLocalDemoDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (
    process.env.NODE_ENV !== "development" ||
    !connectionString
  ) {
    return false;
  }

  try {
    const url = new URL(connectionString);

    return (
      ["localhost", "127.0.0.1"].includes(url.hostname) &&
      url.pathname === "/tuition_management_v2" &&
      url.username === "tuition_app"
    );
  } catch {
    return false;
  }
}

async function updateDemoStudent(
  studentId: string,
  formData: FormData
) {
  "use server";

  // This is NOT a substitute for staff authentication.
  if (!isLocalDemoDatabase()) {
    throw new Error("Demo editing is disabled.");
  }

  const fullName = String(
    formData.get("fullName") ?? ""
  ).trim();

  const feeInput = String(
    formData.get("monthlyFee") ?? ""
  ).trim();

  const validFee =
    /^(0|[1-9]\d{0,4})(?:\.\d{1,2})?$/.test(feeInput);

  if (
    fullName.length === 0 ||
    fullName.length > 100 ||
    !validFee
  ) {
    redirect(
      `/staff/students/${studentId}/edit?error=invalid`
    );
  }

  const [ringgit, cents = ""] = feeInput.split(".");

  const monthlyFeeSen =
    Number(ringgit) * 100 +
    Number(cents.padEnd(2, "0"));

  const existingStudent = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });

  if (!existingStudent) {
    notFound();
  }

  await prisma.student.update({
    where: { id: studentId },
    data: {
      fullName,
      feePlan: {
        upsert: {
          create: { monthlyFeeSen },
          update: { monthlyFeeSen },
        },
      },
    },
  });

  revalidatePath("/staff/students");
  redirect("/staff/students");
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditStudentPage({
  params,
  searchParams,
}: PageProps) {
  if (!isLocalDemoDatabase()) {
    notFound();
  }

  const { id } = await params;
  const { error } = await searchParams;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { feePlan: true },
  });

  if (!student) {
    notFound();
  }

  const currentFee = student.feePlan
    ? (student.feePlan.monthlyFeeSen / 100).toFixed(2)
    : "0.00";

  const saveStudent = updateDemoStudent.bind(
    null,
    student.id
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/staff/students"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Student List
        </Link>

        <section className="mt-6 rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">
            Edit Student / 修改学生资料
          </h1>

          <p className="mt-2 text-sm text-amber-700">
            Local demo only. Use fictional student data.
          </p>

          {error === "invalid" && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-red-700"
            >
              Please check the student name and monthly fee.
            </p>
          )}

          <form action={saveStudent} className="mt-6 space-y-5">
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
                required
                maxLength={100}
                defaultValue={student.fullName}
                className="w-full rounded-lg border p-3"
              />
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
                required
                inputMode="decimal"
                defaultValue={currentFee}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Changes / 保存修改
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
