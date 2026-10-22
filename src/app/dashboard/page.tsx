
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "STAFF") {
    redirect("/staff");
  }

  if (role === "TEACHER") {
    redirect("/teacher");
  }

  if (role === "STUDENT") {
    redirect("/student");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-8">
        <h1 className="text-xl font-bold">
          Account Role Not Configured
        </h1>

        <p className="mt-3 text-slate-600">
          Your account does not have a recognized role.
          Please contact an administrator.
        </p>

        <Link
          href="/login"
          className="mt-5 inline-block text-blue-600 hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}
