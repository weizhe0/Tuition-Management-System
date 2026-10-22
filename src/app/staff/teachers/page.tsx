import Link from "next/link";
import { requireRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";
import {
  createTeacher,
  updateTeacher,
  reassignClass,
} from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const messages: Record<string, string> = {
  created: "Teacher profile created successfully.",
  updated: "Teacher information updated successfully.",
  reassigned: "Class teacher assignment updated.",
  invalid: "Please check the teacher information.",
  duplicate_email: "This email is already used by another teacher.",
  not_found: "Teacher record was not found.",
  has_classes:
    "Reassign this teacher's classes before deactivating the profile.",
  invalid_assignment: "Please select a class and teacher.",
  assignment_unavailable:
    "The selected class or active teacher is unavailable.",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white p-3 text-sm";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700";

export default async function StaffTeachersPage({
  searchParams,
}: PageProps) {
  await requireRole("STAFF");

  const { status } = await searchParams;
  const message = status ? messages[status] : undefined;

  const [teachers, classes] = await Promise.all([
    prisma.teacher.findMany({
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        userId: true,
        classes: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.tuitionClass.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        subject: true,
        teacher: {
          select: {
            fullName: true,
          },
        },
      },
    }),
  ]);

  const activeTeachers = teachers.filter(
    (teacher) => teacher.isActive
  );

  const linkedTeachers = teachers.filter(
    (teacher) => teacher.userId !== null
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-700">
                STAFF PORTAL
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Teacher Management
              </h1>

              <p className="mt-2 text-slate-500">
                Manage teachers, contact information,
                status, and class assignments.
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

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
          >
            {message}
          </div>
        )}

        {/* Statistics */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Teachers
            </p>
            <p className="mt-3 text-3xl font-bold">
              {teachers.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Teachers
            </p>
            <p className="mt-3 text-3xl font-bold text-emerald-700">
              {activeTeachers.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Linked Login Accounts
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-700">
              {linkedTeachers.length}
            </p>
          </div>
        </section>

        {/* Create Teacher */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            1. Add New Teacher
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create a teacher profile. Login access is
            managed separately.
          </p>

          <form
            action={createTeacher}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="new-fullName"
                className={labelClass}
              >
                Full Name *
              </label>

              <input
                id="new-fullName"
                name="fullName"
                required
                minLength={2}
                maxLength={100}
                placeholder="Teacher Lee (Demo)"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="new-email"
                className={labelClass}
              >
                Email
              </label>

              <input
                id="new-email"
                name="email"
                type="email"
                maxLength={254}
                placeholder="teacher.lee@example.test"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="new-phone"
                className={labelClass}
              >
                Phone
              </label>

              <input
                id="new-phone"
                name="phone"
                type="tel"
                maxLength={40}
                placeholder="0123456789"
                className={inputClass}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
              >
                + Add Teacher
              </button>
            </div>
          </form>
        </section>

        {/* Teacher List / Edit */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            2. Teacher List & Edit
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Select Edit Teacher to update a profile.
            Reassign classes before deactivating a teacher.
          </p>

          {teachers.length === 0 ? (
            <p className="mt-6 rounded-xl bg-slate-50 p-6 text-slate-500">
              No teachers registered yet.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {teachers.map((teacher) => (
                <article
                  key={teacher.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        {teacher.fullName}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        Email: {teacher.email ?? "Not provided"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Phone: {teacher.phone ?? "Not provided"}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Assigned Classes: {teacher.classes.length}
                      </p>

                      {teacher.classes.length > 0 && (
                        <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                          {teacher.classes.map((tuitionClass) => (
                            <li key={tuitionClass.id}>
                              {tuitionClass.name}
                            </li>
                          ))}
                        </ul>
                      )}

                      <p className="mt-3 text-xs text-slate-500">
                        {teacher.userId
                          ? "Login account linked. Profile email changes do not change login credentials."
                          : "No login account linked. This teacher cannot sign in yet."}
                      </p>
                    </div>

                    <span
                      className={
                        teacher.isActive
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600"
                      }
                    >
                      {teacher.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <details className="mt-5 border-t border-slate-200 pt-4">
                    <summary className="cursor-pointer font-semibold text-blue-700">
                      Edit Teacher
                    </summary>

                    <form
                      action={updateTeacher}
                      className="mt-5 grid gap-4 md:grid-cols-2"
                    >
                      <input
                        type="hidden"
                        name="teacherId"
                        value={teacher.id}
                      />

                      <div>
                        <label
                          htmlFor={`name-${teacher.id}`}
                          className={labelClass}
                        >
                          Full Name *
                        </label>

                        <input
                          id={`name-${teacher.id}`}
                          name="fullName"
                          defaultValue={teacher.fullName}
                          minLength={2}
                          maxLength={100}
                          required
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`email-${teacher.id}`}
                          className={labelClass}
                        >
                          Email
                        </label>

                        <input
                          id={`email-${teacher.id}`}
                          name="email"
                          type="email"
                          maxLength={254}
                          defaultValue={teacher.email ?? ""}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`phone-${teacher.id}`}
                          className={labelClass}
                        >
                          Phone
                        </label>

                        <input
                          id={`phone-${teacher.id}`}
                          name="phone"
                          type="tel"
                          maxLength={40}
                          defaultValue={teacher.phone ?? ""}
                          className={inputClass}
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <input
                          id={`active-${teacher.id}`}
                          name="isActive"
                          type="checkbox"
                          defaultChecked={teacher.isActive}
                          className="h-5 w-5"
                        />

                        <label
                          htmlFor={`active-${teacher.id}`}
                          className="text-sm font-medium"
                        >
                          Teacher Active
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                          Save Teacher Changes
                        </button>
                      </div>
                    </form>
                  </details>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Reassign Class */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            3. Change Class Teacher
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Assign an existing class to a different active teacher.
            Student enrollments will remain unchanged.
          </p>

          <form
            action={reassignClass}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="tuitionClassId"
                className={labelClass}
              >
                Select Class
              </label>

              <select
                id="tuitionClassId"
                name="tuitionClassId"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select Class
                </option>

                {classes.map((tuitionClass) => (
                  <option
                    key={tuitionClass.id}
                    value={tuitionClass.id}
                  >
                    {tuitionClass.name} —{" "}
                    {tuitionClass.teacher.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="assignedTeacherId"
                className={labelClass}
              >
                New Teacher
              </label>

              <select
                id="assignedTeacherId"
                name="teacherId"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select Active Teacher
                </option>

                {activeTeachers.map((teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.id}
                  >
                    {teacher.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={
                  classes.length === 0 ||
                  activeTeachers.length === 0
                }
                className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Update Class Assignment
              </button>
            </div>
          </form>

          {/* Current assignments */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="font-semibold">
              Current Class Assignments
            </h3>

            {classes.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No classes available.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {classes.map((tuitionClass) => (
                  <div
                    key={tuitionClass.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {tuitionClass.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Subject: {tuitionClass.subject}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-emerald-700">
                      {tuitionClass.teacher.fullName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="pb-4 text-center text-xs text-slate-500">
          Tuition Management System · Teacher Management
        </footer>
      </div>
    </main>
  );
}
