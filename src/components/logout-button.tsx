
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      // End the actual Better Auth session.
      const { error } = await authClient.signOut();

      if (error) {
        setErrorMessage("Logout failed. Please try again.");
        return;
      }

      // Go back to login and refresh server-side session data.
      router.replace("/login");
      router.refresh();
    } catch {
      setErrorMessage(
        "Unable to logout. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Logging out..." : "Logout / 退出登录"}
      </button>

      {errorMessage && (
        <p
          role="alert"
          className="mt-2 max-w-xs text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
