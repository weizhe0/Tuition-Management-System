
import Link from "next/link";
import { requireRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  // 1. Only a logged-in TEACHER can access this page.
  const session = await requireRole("TEACHER");

  // 2. Find the Teacher profile linked to this login account.
  // Never accept an arbitrary teacher ID from the browser.
  const teacher = await prisma.teacher.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      fullName: true,
      email: true,
      isActive: true,
      classes: {
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          subject: true,
          enrollments: {
            select: {
              student: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Login account exists, but Teacher record is not linked.
  if (!teacher) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">
            Teacher Profile Not Linked
          </h1>

          <p className="mt-4 text-slate-600">
            Your login account is valid, but no teacher
            profile is linked to this account.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Please contact Staff to link your teacher profile.
          </p>

          <Link
            href="/login"
            className="mt-5 inline-block text-blue-600 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  // An inactive Teacher cannot view class or student details.
  if (!teacher.isActive) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">
            Teacher Account Inactive
          </h1>

          <p className="mt-4 text-slate-600">
            Your teacher profile is inactive.
            Please contact Staff.
          </p>
        </div>
      </main>
    );
  }

  // Count distinct students across this teacher's classes.
  const uniqueStudentIds = new Set(
    teacher.classes.flatMap((tuitionClass) =>
      tuitionClass.enrollments.map(
        (enrollment) => enrollment.student.id
      )
    )
  );

  const totalClasses = teacher.classes.length;
  const totalStudents = uniqueStudentIds.size;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                TEACHER PORTAL
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Welcome, {teacher.fullName}
              </h1>

              <p className="mt-2 text-slate-500">
                View your assigned classes and enrolled students.
              </p>
            </div>

            <LogoutButton />
          </div>
        </header>

        {/* Summary */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              My Classes
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-700">
              {totalClasses}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              My Students
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-700">
              {totalStudents}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Unique students across your classes
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Teacher Status
            </p>

            <p className="mt-3 text-xl font-semibold text-emerald-700">
              Active
            </p>
          </div>
        </section>

        {/* Teacher Information */}
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
                {teacher.fullName}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Email
              </p>

              <p className="mt-1 font-medium">
                {teacher.email ?? "Not provided"}
              </p>
            </div>
          </div>
        </section>

        {/* Assigned Classes */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            My Assigned Classes
          </h2>

          {teacher.classes.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No classes assigned yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Your classes will appear here after Staff
                assigns a class to your teacher profile.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {teacher.classes.map((tuitionClass) => (
                <div
                  key={tuitionClass.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {tuitionClass.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        Subject: {tuitionClass.subject}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                      {tuitionClass.enrollments.length} students
                    </span>
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <h4 className="font-semibold">
                      Enrolled Students
                    </h4>

                    {tuitionClass.enrollments.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">
                        No students enrolled in this class yet.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {tuitionClass.enrollments.map(
                          (enrollment) => (
                            <li
                              key={enrollment.student.id}
                              className="rounded-lg bg-slate-50 px-4 py-3 text-sm"
                            >
                              {enrollment.student.fullName}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Information Note */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <h2 className="font-semibold text-emerald-900">
            Teacher Access
          </h2>

          <p className="mt-2 text-sm text-emerald-800">
            You can view only the classes assigned to your
            teacher profile and the students enrolled
            in those classes.
          </p>
        </section>
      </div>
    </main>
  );
}
