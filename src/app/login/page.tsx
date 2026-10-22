
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMessage(
          "Login failed. Please check your email and password."
        );
        return;
      }

      // Login succeeded.
      // The server will check the session and user role.
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage(
        "Unable to connect to the login service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setErrorMessage("Sign out failed. Please try again.");
        return;
      }

      setEmail("");
      setPassword("");

      router.replace("/login");
      router.refresh();
    } catch {
      setErrorMessage("Unable to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold">
          Tuition Management System
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Login / 用户登录
        </p>

        <p className="mt-4 text-center text-sm text-slate-600">
          Staff · Teacher · Student
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email / 邮箱
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-lg border border-slate-300 p-3"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password / 密码
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-300 p-3"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login / 登录"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-slate-300 p-3 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Sign Out / Switch Account
        </button>

        <p className="mt-6 text-center text-xs text-amber-700">
          Local development only. Use demo accounts.
        </p>
      </div>
    </main>
  );
}
