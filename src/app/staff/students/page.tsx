
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function StudentDatabaseCheckPage() {
  // Temporary development-only page.
  // Replace this with real staff authorization later.
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const studentCount = await prisma.student.count();

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/staff"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Staff Dashboard
        </Link>

        <section className="mt-6 rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">
            Student Database Check / 学生数据库测试
          </h1>

          <p className="mt-3 text-slate-600">
            This page reads the student count from PostgreSQL using Prisma.
          </p>

          <div className="mt-6 rounded-lg bg-green-50 p-5">
            <p className="font-medium text-green-800">
              PostgreSQL query completed successfully
            </p>

            <p className="mt-3 text-4xl font-bold text-green-900">
              {studentCount}
            </p>

            <p className="mt-1 text-sm text-green-800">
              Students in database
            </p>
          </div>

          <p className="mt-6 text-sm text-amber-700">
            Development-only preview. Real student management will require
            staff authentication and authorization.
          </p>
        </section>
      </div>
    </main>
  );
}
