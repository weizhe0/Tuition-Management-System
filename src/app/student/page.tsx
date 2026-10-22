
import Link from "next/link";
import { requireRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatMoney(sen: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(sen / 100);
}

export default async function StudentPage() {
  // Step 1: Verify this user is a logged-in STUDENT.
  const session = await requireRole("STUDENT");

  // Step 2: Read ONLY the student linked to this login account.
  const student = await prisma.student.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      feePlan: true,
      enrollments: {
        include: {
          tuitionClass: {
            include: {
              teacher: true,
            },
          },
        },
      },
    },
  });

  // The login account exists, but no student profile is linked.
  if (!student) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">
            Student Profile Not Linked
          </h1>

          <p className="mt-4 text-slate-600">
            Your login account is valid, but no student record
            is linked to this account yet.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Please contact Staff to link your student profile.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  const monthlyFee = student.feePlan
    ? formatMoney(student.feePlan.monthlyFeeSen)
    : "Not configured";

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">
                STUDENT PORTAL
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Welcome, {student.fullName}
              </h1>

              <p className="mt-2 text-slate-500">
                View your student information, monthly fee,
                and enrolled classes.
              </p>
            </div>

            <LogoutButton />
          </div>
        </header>

        {/* Summary Cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Student Name
            </p>

            <p className="mt-3 text-xl font-semibold">
              {student.fullName}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Monthly Fee Plan
            </p>

            <p className="mt-3 text-2xl font-bold text-blue-700">
              {monthlyFee}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Enrolled Classes
            </p>

            <p className="mt-3 text-2xl font-bold">
              {student.enrollments.length}
            </p>
          </div>
        </section>

        {/* Student Information */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            My Information
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">
                Full Name
              </p>

              <p className="mt-1 font-medium">
                {student.fullName}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Email
              </p>

              <p className="mt-1 font-medium">
                {student.email ?? "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Phone
              </p>

              <p className="mt-1 font-medium">
                {student.phone ?? "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Student Status
              </p>

              <p className="mt-1 font-medium">
                {student.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </section>

        {/* Enrolled Classes */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            My Classes
          </h2>

          {student.enrollments.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">
              <p className="font-medium text-slate-700">
                No classes enrolled yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Your enrolled classes will appear here
                after Staff registers you for a class.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {student.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <h3 className="text-lg font-semibold">
                    {enrollment.tuitionClass.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Subject: {enrollment.tuitionClass.subject}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Teacher:{" "}
                    {enrollment.tuitionClass.teacher?.fullName ??
                      "Not assigned"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Fee Notice */}
        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="font-semibold text-blue-900">
            Monthly Fee Information
          </h2>

          <p className="mt-2 text-sm text-blue-800">
            This amount comes from your student fee plan.
            It is not an invoice or payment confirmation.
          </p>
        </section>
      </div>
    </main>
  );
}
