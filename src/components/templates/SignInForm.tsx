"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { signInWithCredentials } from "@/lib/auth/actions";
import { getSession } from "next-auth/react";
import { getLandingPath } from "@/lib/auth/redirect";

type LoginStep = "email" | "password" | "set-password";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<LoginStep>("email");
  const [userName, setUserName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const callbackFromUrl = searchParams.get("from");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Email not found. Please sign up first.");
        setIsLoading(false);
        return;
      }

      setUserName(data.data.name || "");

      if (data.data.requiresPasswordSetup) {
        setCurrentStep("set-password");
      } else {
        setCurrentStep("password");
      }

      setIsLoading(false);
    } catch {
      setError("An error occurred while checking email");
      setIsLoading(false);
    }
  };

  const completeSignIn = async () => {
    // Fetch session and figure out where to go
    const session = await getSession();

    // Honor an explicit `from` only if it's a known protected area
    if (
      callbackFromUrl &&
      (callbackFromUrl.startsWith("/admin") ||
        callbackFromUrl.startsWith("/resident"))
    ) {
      // But still enforce role correctness
      if (
        callbackFromUrl.startsWith("/admin") &&
        session?.user?.role === "ADMIN"
      ) {
        router.push(callbackFromUrl);
        router.refresh();
        return;
      }
      if (
        callbackFromUrl.startsWith("/resident") &&
        session?.user?.role === "RESIDENT"
      ) {
        router.push(callbackFromUrl);
        router.refresh();
        return;
      }
    }

    // Default: role-based landing
    router.push(getLandingPath(session));
    router.refresh();
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signInWithCredentials(email, password);

      if (!result.ok) {
        setError(result.error || "Invalid password. Please try again.");
        setIsLoading(false);
        return;
      }

      await completeSignIn();
    } catch {
      setError("An error occurred during sign in");
      setIsLoading(false);
    }
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to set password");
        setIsLoading(false);
        return;
      }

      const result = await signInWithCredentials(email, newPassword);

      if (!result.ok) {
        setError(
          "Password set successfully, but login failed. Please try signing in again.",
        );
        setIsLoading(false);
        return;
      }

      await completeSignIn();
    } catch {
      setError("An error occurred while setting password");
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep("email");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            GDV Resident Hub
          </h1>
          <p className="text-slate-400">
            {currentStep === "email" && "Sign in to your account"}
            {currentStep === "password" &&
              `Welcome back${userName ? `, ${userName}` : ""}!`}
            {currentStep === "set-password" && "Set up your password"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Step 1: Email */}
          {currentStep === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking email...
                  </>
                ) : (
                  "Next"
                )}
              </button>
            </form>
          )}

          {/* Step 2: Password */}
          {currentStep === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="px-4 py-2 bg-slate-800/30 border border-slate-700/50 rounded-lg text-slate-400">
                  {email}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 pr-10 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToEmail}
                className="w-full py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}

          {/* Step 3: Set Password */}
          {currentStep === "set-password" && (
            <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
              <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-sm text-cyan-400">
                  Your password needs to be set up. Please create a new password
                  to continue.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="px-4 py-2 bg-slate-800/30 border border-slate-700/50 rounded-lg text-slate-400">
                  {email}
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 pr-10 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Enter new password"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Must be at least 8 characters with uppercase, lowercase,
                  number, and special character
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 pr-10 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting password...
                  </>
                ) : (
                  "Set Password & Sign In"
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToEmail}
                className="w-full py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}

          {currentStep === "password" && (
            <div className="mt-6 text-center">
              <a
                href="/auth/forgot-password"
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Forgot your password?
              </a>
            </div>
          )}

          <div className="mt-4 text-center">
            <span className="text-sm text-slate-400">
              Don&apos;t have an account?{" "}
            </span>
            <a
              href="/auth/signup"
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              Sign up
            </a>
          </div>
        </div>

        {/* Dev-only admin creds */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <p className="text-xs text-cyan-400 font-medium mb-2">
              Development Mode - Admin Credentials:
            </p>
            <p className="text-xs text-cyan-300 font-mono">
              Email: {process.env.NEXT_PUBLIC_ADMIN_EMAIL}
            </p>
            <p className="text-xs text-cyan-300 font-mono">
              Password: {process.env.NEXT_PUBLIC_ADMIN_PASSWORD}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
