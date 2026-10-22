
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatMoney(sen: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(sen / 100);
}

export default async function StaffStudentsPage() {
  // Temporary development-only access.
  // Real staff authentication will be added later.
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const students = await prisma.student.findMany({
    select: {
      id: true,
      fullName: true,
      isActive: true,
      feePlan: {
        select: {
          monthlyFeeSen: true,
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/staff"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Staff Dashboard
        </Link>

        <header className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">
            Student Management / 学生管理
          </h1>

          <p className="mt-2 text-slate-600">
            Student records from PostgreSQL using Prisma.
          </p>

          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Total Students / 学生人数
            </p>

            <p className="mt-1 text-3xl font-bold text-blue-900">
              {students.length}
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Student List / 学生名单
          </h2>

          <Link
            href="/staff/students/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Student / 新增学生
          </Link>

          {students.length === 0 ? (
            <div className="mt-6 rounded-lg bg-slate-100 p-6 text-center">
              <p className="font-medium">
                No students in database
              </p>

              <p className="mt-2 text-sm text-slate-600">
                目前数据库没有学生。下一步我们会加入测试学生资料。
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Monthly Fee</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-3 font-medium">
                        {student.fullName}
                      </td>

                      <td className="p-3">
                        {student.feePlan
                          ? formatMoney(student.feePlan.monthlyFeeSen)
                          : "Not set"}
                      </td>

                      <td className="p-3">
                        {student.isActive ? "Active" : "Inactive"}
                      </td>

                      <td className="p-3">
                        <Link
                          href={`/staff/students/${student.id}/edit`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Edit / 修改
                        </Link>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 text-sm text-amber-700">
          Development preview only. Do not use real student data
          before authentication and authorization are implemented.
        </p>
      </div>
    </main>
  );
}
