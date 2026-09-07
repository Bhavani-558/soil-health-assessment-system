"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth, getFriendlyErrorMessage } from "../../lib/auth-context";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      const code = err?.code || "";
      setError(getFriendlyErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-700 border-t-transparent"></div>
          <p className="text-lg font-semibold text-green-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
        {/* HEADER */}
        <div className="mb-6 text-center">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-3xl font-bold text-green-800">Soil Health</h1>
          <p className="mt-1 text-sm font-medium text-gray-600">
            Sign in to access your farmer dashboard
          </p>
        </div>

        {/* ERROR MSG */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-100 p-4 text-sm font-medium text-red-700">
            ❌ {error}
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

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-800"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-green-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-green-700 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "⏳ Signing In..." : "🔑 Sign In"}
          </button>
        </form>

        {/* SIGNUP LINK */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-green-700 hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </main>
  );
}
