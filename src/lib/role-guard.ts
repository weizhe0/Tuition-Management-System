
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type UserRole = "STAFF" | "TEACHER" | "STUDENT";

async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireRole(role: UserRole) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== role) {
    redirect("/dashboard");
  }

  return session;
}

export async function assertRole(role: UserRole) {
  const session = await getCurrentSession();

  if (!session || session.user.role !== role) {
    throw new Error("Forbidden: insufficient permissions.");
  }

  return session;
}
