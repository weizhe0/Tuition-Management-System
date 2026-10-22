
import Link from "next/link";
import { requireRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

function formatMoney(sen: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(sen / 100);
}

export default async function StaffStudentsPage({
  searchParams,
}: PageProps) {
  // Only logged-in STAFF can read student information.
  await requireRole("STAFF");

  const { status } = await searchParams;

  const messages: Record<string, string> = {
    created: "Student created successfully.",
    updated: "Student updated successfully.",
  };

  const message = status ? messages[status] : undefined;

  // Read real student records from PostgreSQL.
  const students = await prisma.student.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      feePlan: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  const activeStudents = students.filter(
    (student) => student.isActive
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-700">
                STAFF PORTAL
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Student Management
              </h1>

              <p className="mt-2 text-slate-500">
                Manage student records and monthly fee plans.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/staff"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50"
              >
                Back to Dashboard
              </Link>

              <Link
                href="/staff/students/new"
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Add Student
              </Link>
            </div>
          </div>
        </header>

        {message && (
          <p
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {message}
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Students
            </p>
            <p className="mt-3 text-3xl font-bold">
              {students.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Students
            </p>
            <p className="mt-3 text-3xl font-bold text-emerald-700">
              {activeStudents}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Inactive Students
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-600">
              {students.length - activeStudents}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Registered Students
          </h2>

          {students.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">
              <p className="font-medium text-slate-700">
                No students found.
              </p>

              <Link
                href="/staff/students/new"
                className="mt-4 inline-block text-blue-700 hover:underline"
              >
                Add your first student
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {students.map((student) => (
                <article
                  key={student.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        {student.fullName}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        Email: {student.email ?? "Not provided"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Phone: {student.phone ?? "Not provided"}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Monthly Fee:{" "}
                        <span className="font-semibold text-blue-700">
                          {student.feePlan
                            ? formatMoney(
                                student.feePlan.monthlyFeeSen
                              )
                            : "Not configured"}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Enrolled Classes:{" "}
                        {student._count.enrollments}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Login Account:{" "}
                        {student.userId ? "Linked" : "Not Linked"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={
                          student.isActive
                            ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        }
                      >
                        {student.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                      <Link
                        href={`/staff/students/${student.id}/edit`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Edit Student
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
