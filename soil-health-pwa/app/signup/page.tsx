"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth, getFriendlyErrorMessage } from "../../lib/auth-context";

export default function SignupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only auto-redirect if already signed in and not coming from a successful signup flow
    if (!authLoading && user && !success) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router, success]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your Full Name.");
      return;
    }

    if (!email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter passwords carefully.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName.trim(),
        });
      }

      // Sign out so user manually logs in as required by flow
      await signOut(auth);
      setSuccess(true);
    } catch (err: any) {
      console.error("Signup error:", err);
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

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl text-center">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-2xl font-bold text-green-800">Account Created!</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome, <span className="font-semibold text-gray-800">{fullName}</span>. Your account has been created successfully. Please sign in with your email and password.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block w-full rounded-xl bg-green-700 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-green-800"
          >
            Return to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
        {/* HEADER */}
        <div className="mb-6 text-center">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-3xl font-bold text-green-800">Create Account</h1>
          <p className="mt-1 text-sm font-medium text-gray-600">
            Join Soil Health to manage and analyze your soil
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
              htmlFor="fullName"
              className="block text-sm font-semibold text-gray-800"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Bhavani Chegondi"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-200"
            />
          </div>

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
              placeholder="bhavanich520@gmail.com"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-green-700 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "⏳ Creating Account..." : "✨ Create Account"}
          </button>
        </form>

        {/* LOGIN LINK */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-green-700 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
