"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getFriendlyErrorMessage } from "../../lib/auth-context";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage(
        "A password reset link has been sent to your email address. Please check your inbox and follow instructions."
      );
    } catch (err: any) {
      console.error("Forgot password error:", err);
      const code = err?.code || "";
      setError(getFriendlyErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
        {/* HEADER */}
        <div className="mb-6 text-center">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-3xl font-bold text-green-800">Forgot Password</h1>
          <p className="mt-1 text-sm font-medium text-gray-600">
            Enter your registered email to receive a password reset link
          </p>
        </div>

        {/* ERROR MSG */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-100 p-4 text-sm font-medium text-red-700">
            ❌ {error}
          </div>
        )}

        {/* SUCCESS MSG */}
        {message && (
          <div className="mb-5 rounded-xl bg-green-100 p-4 text-sm font-medium text-green-800">
            ✅ {message}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-800"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-green-700 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "⏳ Sending Email..." : "📧 Send Reset Link"}
          </button>
        </form>

        {/* BACK TO LOGIN */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-bold text-green-700 hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
