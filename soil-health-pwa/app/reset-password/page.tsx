"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getFriendlyErrorMessage } from "../../lib/auth-context";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!oobCode) {
      setError("Invalid or missing password reset code in URL.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter passwords carefully.");
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err: any) {
      console.error("Reset password error:", err);
      const code = err?.code || "";
      setError(getFriendlyErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="text-2xl font-bold text-green-800">Password Reset Complete</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your password has been updated successfully. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block w-full rounded-xl bg-green-700 py-3.5 text-base font-bold text-white shadow-md hover:bg-green-800"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
      {/* HEADER */}
      <div className="mb-6 text-center">
        <div className="text-5xl mb-2">🌱</div>
        <h1 className="text-3xl font-bold text-green-800">Reset Password</h1>
        <p className="mt-1 text-sm font-medium text-gray-600">
          Create a new secure password for your account
        </p>
      </div>

      {/* ERROR MSG */}
      {error && (
        <div className="mb-5 rounded-xl bg-red-100 p-4 text-sm font-medium text-red-700">
          ❌ {error}
        </div>
      )}

      {!oobCode && (
        <div className="mb-5 rounded-xl bg-yellow-100 p-4 text-sm font-medium text-yellow-800">
          ⚠️ No reset code detected in the link. Please open the link sent to your email.
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-semibold text-gray-800"
          >
            New Password
          </label>
          <div className="relative mt-1">
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-gray-300 bg-white p-3 pr-10 text-black outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-gray-800"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !oobCode}
          className="mt-6 w-full rounded-xl bg-green-700 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "⏳ Updating Password..." : "🔒 Set New Password"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <Link
          href="/login"
          className="font-bold text-green-700 hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-8">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-700 border-t-transparent"></div>
            <p className="text-lg font-semibold text-green-800">Loading reset form...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
