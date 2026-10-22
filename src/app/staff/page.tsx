
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

export default async function StaffPage() {
  // Security: Only STAFF can access this page.
  const session = await requireRole("STAFF");

  // Read real data from PostgreSQL.
  const [
    studentCount,
    activeStudentCount,
    teacherCount,
    activeTeacherCount,
    classCount,
    enrollmentCount,
    recentStudents,
    teachers,
    classes,
  ] = await Promise.all([
    prisma.student.count(),

    prisma.student.count({
      where: {
        isActive: true,
      },
    }),

    prisma.teacher.count(),

    prisma.teacher.count({
      where: {
        isActive: true,
      },
    }),

    prisma.tuitionClass.count(),

    prisma.enrollment.count(),

    prisma.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        feePlan: {
          select: {
            monthlyFeeSen: true,
          },
        },
      },
    }),

    prisma.teacher.findMany({
      orderBy: {
        fullName: "asc",
      },
      take: 6,
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        userId: true,
        _count: {
          select: {
            classes: true,
          },
        },
      },
    }),

    prisma.tuitionClass.findMany({
      orderBy: {
        name: "asc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        subject: true,
        teacher: {
          select: {
            fullName: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    }),
  ]);

  const statistics = [
    {
      title: "Total Students",
      value: studentCount,
      description: `${activeStudentCount} active students`,
      color: "text-blue-700",
    },
    {
      title: "Total Teachers",
      value: teacherCount,
      description: `${activeTeacherCount} active teachers`,
      color: "text-violet-700",
    },
    {
      title: "Total Classes",
      value: classCount,
      description: "Tuition classes",
      color: "text-emerald-700",
    },
    {
      title: "Enrollments",
      value: enrollmentCount,
      description: "Student-class registrations",
      color: "text-amber-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ============================= */}
        {/* STAFF DASHBOARD HEADER        */}
        {/* ============================= */}

        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-700">
                STAFF PORTAL
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Staff Management Dashboard
              </h1>

              <p className="mt-2 text-slate-600">
                Welcome, {session.user.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Manage students, teachers, classes, and enrollments.
              </p>
            </div>

            <LogoutButton />
          </div>
        </header>

        {/* ============================= */}
        {/* DASHBOARD STATISTICS          */}
        {/* ============================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((statistic) => (
            <div
              key={statistic.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {statistic.title}
              </p>

              <p
                className={`mt-3 text-3xl font-bold ${statistic.color}`}
              >
                {statistic.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {statistic.description}
              </p>
            </div>
          ))}
        </section>

        {/* ============================= */}
        {/* MANAGEMENT FUNCTIONS          */}
        {/* ============================= */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Management Functions
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Select a function to manage your tuition center.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {/* STUDENT MANAGEMENT */}

            <Link
              href="/staff/students"
              className="rounded-xl border border-blue-200 bg-blue-50 p-6 transition hover:border-blue-400 hover:bg-blue-100"
            >
              <p className="text-lg font-bold text-blue-900">
                Student Management
              </p>

              <p className="mt-2 text-sm text-blue-800">
                View registered students, add new students,
                edit student details, and manage monthly fees.
              </p>

              <p className="mt-5 text-sm font-semibold text-blue-700">
                Manage Students →
              </p>
            </Link>

            {/* TEACHER MANAGEMENT */}

            <Link
              href="/staff/teachers"
              className="rounded-xl border border-violet-200 bg-violet-50 p-6 transition hover:border-violet-400 hover:bg-violet-100"
            >
              <p className="text-lg font-bold text-violet-900">
                Teacher Management
              </p>

              <p className="mt-2 text-sm text-violet-800">
                Add new teachers, edit teacher information,
                manage active status, and change class assignments.
              </p>

              <p className="mt-5 text-sm font-semibold text-violet-700">
                Manage Teachers →
              </p>
            </Link>

            {/* CLASS MANAGEMENT */}

            <Link
              href="/staff/classes"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 transition hover:border-emerald-400 hover:bg-emerald-100"
            >
              <p className="text-lg font-bold text-emerald-900">
                Class Management
              </p>

              <p className="mt-2 text-sm text-emerald-800">
                Create tuition classes, assign teachers,
                and enroll students into classes.
              </p>

              <p className="mt-5 text-sm font-semibold text-emerald-700">
                Manage Classes →
              </p>
            </Link>

            {/* ENROLLMENT MANAGEMENT */}

            <Link
              href="/staff/classes"
              className="rounded-xl border border-amber-200 bg-amber-50 p-6 transition hover:border-amber-400 hover:bg-amber-100"
            >
              <p className="text-lg font-bold text-amber-900">
                Student Enrollment
              </p>

              <p className="mt-2 text-sm text-amber-800">
                Register students into existing classes
                and review class enrollment information.
              </p>

              <p className="mt-5 text-sm font-semibold text-amber-700">
                Manage Enrollments →
              </p>
            </Link>
          </div>

          {/* QUICK ACTIONS */}

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800">
              Quick Actions
            </h3>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/staff/students/new"
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Add New Student
              </Link>

              <Link
                href="/staff/teachers"
                className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
              >
                + Add New Teacher
              </Link>

              <Link
                href="/staff/classes"
                className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                + Create New Class
              </Link>
            </div>
          </div>
        </section>

        {/* ============================= */}
        {/* RECENT STUDENTS               */}
        {/* ============================= */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold">
              Recent Students
            </h2>

            <Link
              href="/staff/students"
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              View All Students →
            </Link>
          </div>

          {recentStudents.length === 0 ? (
            <p className="mt-5 text-slate-500">
              No students registered yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {student.fullName}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {student.email ?? "No email"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Monthly Fee:{" "}
                      {student.feePlan
                        ? formatMoney(
                            student.feePlan.monthlyFeeSen
                          )
                        : "Not configured"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Status:{" "}
                      {student.isActive
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>

                  <Link
                    href={`/staff/students/${student.id}/edit`}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Edit Student
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ============================= */}
        {/* TEACHER OVERVIEW              */}
        {/* ============================= */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold">
              Teacher Overview
            </h2>

            <Link
              href="/staff/teachers"
              className="text-sm font-semibold text-violet-700 hover:underline"
            >
              Manage Teachers →
            </Link>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Registered teachers and their assigned classes.
          </p>

          {teachers.length === 0 ? (
            <p className="mt-5 text-slate-500">
              No teachers registered yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-lg font-semibold">
                      {teacher.fullName}
                    </p>

                    <span
                      className={
                        teacher.isActive
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      }
                    >
                      {teacher.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {teacher.email ?? "No email"}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    Assigned Classes:{" "}
                    {teacher._count.classes}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {teacher.userId
                      ? "Login Account: Linked"
                      : "Login Account: Not Linked"}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5">
            <Link
              href="/staff/teachers"
              className="inline-block rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Open Teacher Management
            </Link>
          </div>
        </section>

        {/* ============================= */}
        {/* CLASS OVERVIEW                */}
        {/* ============================= */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold">
              Class Overview
            </h2>

            <Link
              href="/staff/classes"
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              Manage Classes →
            </Link>
          </div>

          {classes.length === 0 ? (
            <p className="mt-5 text-slate-500">
              No classes created yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {classes.map((tuitionClass) => (
                <div
                  key={tuitionClass.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {tuitionClass.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        Subject: {tuitionClass.subject}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Teacher:{" "}
                        {tuitionClass.teacher.fullName}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                      {tuitionClass._count.enrollments} students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ============================= */}
        {/* FOOTER                        */}
        {/* ============================= */}

        <footer className="pb-4 text-center text-xs text-slate-500">
          Tuition Management System · Staff Portal
        </footer>
      </div>
    </main>
  );
}
