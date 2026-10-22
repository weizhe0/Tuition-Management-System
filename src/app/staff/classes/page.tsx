
import Link from "next/link";
import { requireRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";
import { createClass, enrollStudent } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const messages: Record<string, string> = {
  class_created: "Class created successfully.",
  student_enrolled:
    "Student enrollment saved successfully. Duplicate enrollments are prevented.",
  invalid_class: "Please enter valid class details.",
  teacher_unavailable: "The selected teacher is not available.",
  invalid_enrollment: "Please select a class and student.",
  class_unavailable: "The selected class does not exist.",
  student_unavailable: "The selected student is not available.",
};

export default async function StaffClassesPage({
  searchParams,
}: PageProps) {
  await requireRole("STAFF");

  const { status } = await searchParams;
  const message = status ? messages[status] : undefined;

  const [teachers, students, classes] = await Promise.all([
    prisma.teacher.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
      },
    }),

    prisma.student.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
      },
    }),

    prisma.tuitionClass.findMany({
      orderBy: { name: "asc" },
      include: {
        teacher: {
          select: {
            fullName: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const canCreateClass = teachers.length > 0;
  const canEnrollStudent =
    classes.length > 0 && students.length > 0;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                STAFF PORTAL
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Class Management
              </h1>

              <p className="mt-2 text-slate-500">
                Create classes, assign teachers, and enroll students.
              </p>
            </div>

            <Link
              href="/staff"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Back to Staff Dashboard
            </Link>
          </div>
        </header>

        {message && (
          <div
            role="status"
            className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
          >
            {message}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Classes
            </p>

            <p className="mt-3 text-3xl font-bold">
              {classes.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Teachers
            </p>

            <p className="mt-3 text-3xl font-bold">
              {teachers.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Students
            </p>

            <p className="mt-3 text-3xl font-bold">
              {students.length}
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create Class */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              1. Create New Class
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create a tuition class and assign an active teacher.
            </p>

            <form
              action={createClass}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="className"
                  className="mb-2 block text-sm font-medium"
                >
                  Class Name
                </label>

                <input
                  id="className"
                  name="name"
                  type="text"
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="Mathematics (Demo)"
                  className="w-full rounded-lg border border-slate-300 p-3"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="Mathematics"
                  className="w-full rounded-lg border border-slate-300 p-3"
                />
              </div>

              <div>
                <label
                  htmlFor="teacherId"
                  className="mb-2 block text-sm font-medium"
                >
                  Assign Teacher
                </label>

                <select
                  id="teacherId"
                  name="teacherId"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 bg-white p-3"
                >
                  <option value="" disabled>
                    Select Teacher
                  </option>

                  {teachers.map((teacher) => (
                    <option
                      key={teacher.id}
                      value={teacher.id}
                    >
                      {teacher.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!canCreateClass}
                className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Class
              </button>
            </form>

            {!canCreateClass && (
              <p className="mt-4 text-sm text-amber-700">
                No active teachers available.
              </p>
            )}
          </section>

          {/* Enroll Student */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              2. Enroll Student
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add an existing student to an existing class.
            </p>

            <form
              action={enrollStudent}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="tuitionClassId"
                  className="mb-2 block text-sm font-medium"
                >
                  Select Class
                </label>

                <select
                  id="tuitionClassId"
                  name="tuitionClassId"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 bg-white p-3"
                >
                  <option value="" disabled>
                    Select Class
                  </option>

                  {classes.map((tuitionClass) => (
                    <option
                      key={tuitionClass.id}
                      value={tuitionClass.id}
                    >
                      {tuitionClass.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="studentId"
                  className="mb-2 block text-sm font-medium"
                >
                  Select Student
                </label>

                <select
                  id="studentId"
                  name="studentId"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 bg-white p-3"
                >
                  <option value="" disabled>
                    Select Student
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!canEnrollStudent}
                className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enroll Student
              </button>
            </form>

            {!canEnrollStudent && (
              <p className="mt-4 text-sm text-amber-700">
                Create a class and ensure there is an active
                student before enrolling.
              </p>
            )}
          </section>
        </div>

        {/* Existing Classes */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            3. Existing Classes
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Review teacher assignments and student enrollment.
          </p>

          {classes.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">
              <p className="font-medium text-slate-700">
                No classes created yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {classes.map((tuitionClass) => (
                <article
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

                      <p className="mt-1 text-sm text-slate-600">
                        Teacher:{" "}
                        {tuitionClass.teacher?.fullName ??
                          "Not assigned"}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {tuitionClass.enrollments.length} students
                    </span>
                  </div>

                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="font-semibold">
                      Enrolled Students
                    </p>

                    {tuitionClass.enrollments.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">
                        No students enrolled.
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
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
