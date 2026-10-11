"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Check, AlertCircle, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.6-5.2 3.64-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.28v3.13C3.26 21.3 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.28C.46 8.22 0 10.05 0 12s.46 3.78 1.28 5.4l4.04-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.28 6.6l4.04 3.13c.94-2.83 3.58-4.98 6.68-4.98z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 fill-current text-[#111111]" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.66-.82 1.11-1.95.99-3.09-.95.04-2.1.64-2.77 1.43-.59.68-1.11 1.78-.97 2.87 1.06.08 2.09-.39 2.75-1.21" />
    </svg>
  );
}

function DualAuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/account";
  const isDeactivated = searchParams.get("deactivated") === "true";
  const initialSignUp =
    searchParams.get("mode") === "signup" || searchParams.get("mode") === "register";

  const { login, register, loginDemoPatron } = useAuth();

  // Sliding state: false = Sign In active, true = Sign Up active
  const [isSignUpActive, setIsSignUpActive] = useState(initialSignUp);

  // Sign In form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState("");

  // Sign Up form states
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState("");

  // Handle Sign In submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setSignInLoading(true);

    const isAdminEmail = signInEmail.toLowerCase().includes("admin");
    const result = await login(
      signInEmail,
      signInPassword,
      isAdminEmail ? "admin" : "customer"
    );

    setSignInLoading(false);

    if (result && !result.success) {
      if (result.requiresVerification) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("noir_verification_email", result.email || signInEmail);
        }
        router.push(
          `/verify-email?email=${encodeURIComponent(
            result.email || signInEmail
          )}&redirect=${encodeURIComponent(redirectTarget)}`
        );
        return;
      }
      setSignInError(result.error || "Authentication failed. Please verify your credentials.");
      return;
    }

    if (isAdminEmail) {
      router.push("/admin");
    } else {
      router.push(redirectTarget);
    }
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setSignUpLoading(true);

    const result = await register(signUpName, signUpEmail, signUpPassword);
    setSignUpLoading(false);

    if (result && !result.success) {
      setSignUpError(result.error || "Registration failed. Please check your details.");
      return;
    }

    if (result?.requiresOtp) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("noir_verification_email", signUpEmail);
        if (result.emailError) {
          sessionStorage.setItem("noir_verification_email_error", result.emailError);
        }
      }
      router.push(
        `/verify-email?email=${encodeURIComponent(
          signUpEmail
        )}&redirect=${encodeURIComponent(redirectTarget)}`
      );
      return;
    }

    router.push(redirectTarget);
  };

  // Handle Quick Demo / Social Patron Access
  const handleSocialOrDemoAuth = async () => {
    setSignInError("");
    setSignUpError("");
    setSignInLoading(true);
    await loginDemoPatron();
    setSignInLoading(false);
    router.push(redirectTarget);
  };

  return (
    <div className="auth-slider-body font-sans">
      {/* Top Floating Utility Header */}
      <div className="w-full max-w-[840px] mx-auto mb-6 px-4 flex items-center justify-between text-[#111111]">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#111111] transition-colors inline-flex items-center gap-2 font-mono font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </Link>

        <Link
          href="/"
          className="font-editorial text-2xl tracking-[0.28em] font-semibold uppercase text-[#111111] hover:opacity-80 transition-opacity"
        >
          NOIR
        </Link>

        <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B6B] font-mono tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">TLS 1.3 SECURE</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. MOBILE-ONLY VIEWPORT CARD (< 768px)                   */}
      {/* ======================================================== */}
      <div className="block md:hidden w-full max-w-[430px] mx-auto bg-white rounded-none p-6 sm:p-8 shadow-[0_20px_50px_rgba(17,17,17,0.06)] border border-[#D8D5CF]">
        {/* Integrated Segmented Switcher */}
        <div className="flex bg-[#F5F3EF] border border-[#D8D5CF] p-1 rounded-none mb-6">
          <button
            type="button"
            onClick={() => setIsSignUpActive(false)}
            className={`flex-1 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em] transition-all duration-200 cursor-pointer ${!isSignUpActive
                ? "bg-[#111111] text-[#F5F3EF] shadow-xs font-semibold"
                : "text-[#6B6B6B] hover:text-[#111111]"
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUpActive(true)}
            className={`flex-1 py-2.5 text-[11px] font-mono uppercase tracking-[0.18em] transition-all duration-200 cursor-pointer ${isSignUpActive
                ? "bg-[#111111] text-[#F5F3EF] shadow-xs font-semibold"
                : "text-[#6B6B6B] hover:text-[#111111]"
              }`}
          >
            Create Account
          </button>
        </div>

        {/* MOBILE: SIGN IN FORM */}
        {!isSignUpActive && (
          <form onSubmit={handleSignInSubmit} className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F5F3EF] border border-[#E2DFD8] text-[9px] uppercase font-mono tracking-[0.25em] text-[#555555] mb-2">
              <ShieldCheck className="w-3 h-3 text-[#111111]" />
              <span>Atelier Access</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight uppercase">
              Sign In
            </h1>
            <p className="text-xs text-[#777777] font-light tracking-wide mt-1 mb-5">
              Enter credentials to access your bespoke orders & saved silhouettes.
            </p>

            {isDeactivated && (
              <div className="w-full my-2 p-2.5 bg-[#111111] text-[#F5F3EF] text-xs text-left rounded-none flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Account deactivated. Confirmation dispatched to inbox.</span>
              </div>
            )}

            {signInError && (
              <div className="w-full my-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs text-left rounded-none flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                <span>{signInError}</span>
              </div>
            )}

            <div className="w-full space-y-3.5 mt-1 text-left">
              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#666666] block font-mono font-medium mb-1.5">
                  Client Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="client@noir.studio"
                    autoComplete="email"
                    className="w-full bg-[#FAF9F6] border border-[#D8D5CF] pl-10 pr-4 py-3 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-mono rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#666666] block font-mono font-medium mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showSignInPassword ? "text" : "password"}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full bg-[#FAF9F6] border border-[#D8D5CF] pl-10 pr-11 py-3 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-mono rounded-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] p-1 transition-colors"
                    aria-label={showSignInPassword ? "Hide password" : "Show password"}
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full text-right mt-1.5 mb-2">
              <Link
                href="/forgot-password"
                className="text-[10px] text-[#666666] hover:text-[#111111] font-mono uppercase tracking-wider underline underline-offset-4 transition-colors"
              >
                Forgot Passkey?
              </Link>
            </div>

            <button
              type="submit"
              disabled={signInLoading}
              className="w-full mt-2 py-3.5 bg-[#111111] hover:bg-black text-[#F5F3EF] text-[11px] uppercase tracking-[0.2em] font-medium rounded-none shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 font-mono"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{signInLoading ? "Authenticating..." : "Authenticate & Enter"}</span>
            </button>

            {/* Social Divider at the END */}
            <div className="relative my-4 w-full text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2DFD8]" />
              </div>
              <span className="relative bg-white px-3 text-[9px] text-[#888888] uppercase tracking-[0.25em] font-mono">
                or continue with
              </span>
            </div>

            {/* Only Google and Apple Social Icons at the END */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={handleSocialOrDemoAuth}
                className="auth-social-btn"
                title="Continue with Google"
                aria-label="Continue with Google"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={handleSocialOrDemoAuth}
                className="auth-social-btn"
                title="Continue with Apple"
                aria-label="Continue with Apple"
              >
                <AppleIcon />
                <span>Apple</span>
              </button>
            </div>

            <div className="mt-5 text-xs text-[#6B6B6B]">
              New to NOIR?{" "}
              <button
                type="button"
                onClick={() => setIsSignUpActive(true)}
                className="text-[#111111] font-semibold underline underline-offset-4 hover:opacity-80 cursor-pointer ml-1 font-mono uppercase text-[11px]"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* MOBILE: SIGN UP FORM */}
        {isSignUpActive && (
          <form onSubmit={handleSignUpSubmit} className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F5F3EF] border border-[#E2DFD8] text-[9px] uppercase font-mono tracking-[0.25em] text-[#555555] mb-2">
              <span>Patron Membership</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight uppercase">
              Create Account
            </h1>
            <p className="text-xs text-[#777777] font-light tracking-wide mt-1 mb-4">
              Register for private garment reservations, runway releases & bespoke notes.
            </p>

            {signUpError && (
              <div className="w-full my-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs text-left rounded-none flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                <span>{signUpError}</span>
              </div>
            )}

            <div className="w-full space-y-3.5 mt-1 text-left">
              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#666666] block font-mono font-medium mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Julian Vance"
                    autoComplete="name"
                    className="w-full bg-[#FAF9F6] border border-[#D8D5CF] pl-10 pr-4 py-3 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-mono rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#666666] block font-mono font-medium mb-1.5">
                  Client Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="patron@noir.studio"
                    autoComplete="email"
                    className="w-full bg-[#FAF9F6] border border-[#D8D5CF] pl-10 pr-4 py-3 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-mono rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-[#666666] block font-mono font-medium mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="w-full bg-[#FAF9F6] border border-[#D8D5CF] pl-10 pr-11 py-3 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-mono rounded-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] p-1 transition-colors"
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={signUpLoading}
              className="w-full mt-4 py-3.5 bg-[#111111] hover:bg-black text-[#F5F3EF] text-[11px] uppercase tracking-[0.2em] font-medium rounded-none shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 font-mono"
            >
              <span>{signUpLoading ? "Registering..." : "Register As Patron"}</span>
            </button>

            {/* Social Divider at the END */}
            <div className="relative my-4 w-full text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2DFD8]" />
              </div>
              <span className="relative bg-white px-3 text-[9px] text-[#888888] uppercase tracking-[0.25em] font-mono">
                or register with
              </span>
            </div>

            {/* Only Google and Apple Social Icons at the END */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={handleSocialOrDemoAuth}
                className="auth-social-btn"
                title="Register with Google"
                aria-label="Register with Google"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={handleSocialOrDemoAuth}
                className="auth-social-btn"
                title="Register with Apple"
                aria-label="Register with Apple"
              >
                <AppleIcon />
                <span>Apple</span>
              </button>
            </div>

            <div className="mt-5 text-xs text-[#6B6B6B]">
              Already an Atelier Patron?{" "}
              <button
                type="button"
                onClick={() => setIsSignUpActive(false)}
                className="text-[#111111] font-semibold underline underline-offset-4 hover:opacity-80 cursor-pointer ml-1 font-mono uppercase text-[11px]"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP & TABLET VIEWPORT CARD (>= 768px)             */}
      {/* Authentic Sliding Dual Overlay Architecture              */}
      {/* ======================================================== */}
      <div
        className={`hidden md:block auth-slider-container ${isSignUpActive ? "active" : ""
          }`}
        id="container"
      >
        {/* SIGN UP FORM CONTAINER */}
        <div className="auth-form-container auth-sign-up">
          <form onSubmit={handleSignUpSubmit} className="auth-form">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F5F3EF] border border-[#E2DFD8] text-[9px] uppercase font-mono tracking-[0.25em] text-[#555555] mb-2">
              <span>Patron Membership</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight uppercase">
              Create Account
            </h1>
            <span className="auth-subtitle text-[11px] text-[#777777] font-light tracking-wide mb-2">
              Register for tailored silhouette reservations & atelier notes
            </span>

            {signUpError && (
              <div className="w-full max-w-[340px] my-2 p-2 bg-red-50 border border-red-200 text-red-700 text-xs text-left rounded-none flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                <span>{signUpError}</span>
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-input-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Julian Vance"
                  autoComplete="name"
                  className="auth-input font-mono"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Client Email</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="patron@noir.studio"
                  autoComplete="email"
                  className="auth-input font-mono"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Security Passkey</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" />
                <input
                  type={showSignUpPassword ? "text" : "password"}
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="auth-input pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] p-1 transition-colors"
                  aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="w-full max-w-[340px]">
              <button
                type="submit"
                disabled={signUpLoading}
                className="auth-btn-primary font-mono"
              >
                {signUpLoading ? "Registering..." : "Register As Patron"}
              </button>
            </div>

            {/* Social Divider at the END */}
            <div className="relative my-3.5 w-full max-w-[340px] text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2DFD8]" />
              </div>
              <span className="relative bg-white px-2.5 text-[9px] text-[#888888] uppercase tracking-[0.25em] font-mono">
                or register with
              </span>
            </div>

            {/* Only Google and Apple Social Icons at the END */}
            <div className="auth-social-row">
              <button
                type="button"
                onClick={handleSocialOrDemoAuth}
                className="auth-social-btn"
                title="Register with Google"
                aria-label="Register with Google"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={handleSocialOrDemoAuth}
                className="auth-social-btn"
                title="Register with Apple"
                aria-label="Register with Apple"
              >
                <AppleIcon />
                <span>Apple</span>
              </button>
            </div>
          </form>
        </div>

        {/* SIGN IN FORM CONTAINER */}
        <div className="auth-form-container auth-sign-in">
          <form onSubmit={handleSignInSubmit} className="auth-form">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F5F3EF] border border-[#E2DFD8] text-[9px] uppercase font-mono tracking-[0.25em] text-[#555555] mb-2">
              <ShieldCheck className="w-3 h-3 text-[#111111]" />
              <span>Atelier Access</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight uppercase">
              Sign In
            </h1>
            <span className="auth-subtitle text-[11px] text-[#777777] font-light tracking-wide mb-2">
              Enter credentials to access your bespoke orders & archives
            </span>

            {isDeactivated && (
              <div className="w-full max-w-[340px] my-2 p-2 bg-[#111111] text-[#F5F3EF] text-xs text-left rounded-none flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Account deactivated. Confirmation dispatched to inbox.</span>
              </div>
            )}

            {signInError && (
              <div className="w-full max-w-[340px] my-2 p-2 bg-red-50 border border-red-200 text-red-700 text-xs text-left rounded-none flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                <span>{signInError}</span>
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-input-label">Client Email</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="client@noir.studio"
                  autoComplete="email"
                  className="auth-input font-mono"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Security Passkey</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" />
                <input
                  type={showSignInPassword ? "text" : "password"}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="auth-input pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] p-1 transition-colors"
                  aria-label={showSignInPassword ? "Hide password" : "Show password"}
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="w-full max-w-[340px] text-right mb-1">
              <Link
                href="/forgot-password"
                className="auth-forgot"
              >
                Forgot Passkey?
              </Link>
            </div>

            <div className="w-full max-w-[340px]">
              <button
                type="submit"
                disabled={signInLoading}
                className="auth-btn-primary font-mono"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{signInLoading ? "Authenticating..." : "Authenticate & Enter"}</span>
              </button>
            </div>

            {/* Social Divider at the END */}
            <div className="relative my-3.5 w-full max-w-[340px] text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2DFD8]" />
              </div>
              <span className="relative bg-white px-2.5 text-[9px] text-[#888888] uppercase tracking-[0.25em] font-mono">
                or continue with
              </span>
            </div>

            {/* Only Google and Apple Social Icons at the END */}
            <div className="auth-social-row">
              <button
                type="button"
                onClick={handleSocialOrDemoAuth}
                className="auth-social-btn"
                title="Sign in with Google"
                aria-label="Sign in with Google"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={handleSocialOrDemoAuth}
                className="auth-social-btn"
                title="Sign in with Apple"
                aria-label="Sign in with Apple"
              >
                <AppleIcon />
                <span>Apple</span>
              </button>
            </div>
          </form>
        </div>

        {/* TOGGLE CONTAINER (DESKTOP & TABLET ANIMATED SLIDER) */}
        <div className="auth-toggle-container">
          <div className="auth-toggle">
            {/* Toggle Left: Shown when in Sign Up mode, to return to Sign In */}
            <div className="auth-toggle-panel auth-toggle-left">
              <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#F5F3EF]/60 block mb-2">
                CHAPTER // AUTHENTICATION
              </span>
              <h2 className="font-editorial text-4xl lg:text-5xl font-normal tracking-tight uppercase leading-[1.1] text-[#F5F3EF]">
                WELCOME <br /> BACK
              </h2>
              <p className="text-xs text-[#F5F3EF]/75 font-light leading-relaxed max-w-xs mt-4 mb-6">
                To access your personal garment archives, saved silhouettes, and active atelier orders, please authenticate your patron account.
              </p>
              <button
                type="button"
                id="login"
                onClick={() => setIsSignUpActive(false)}
                className="auth-btn-ghost"
              >
                SIGN IN
              </button>
              <div className="mt-8 text-[9px] font-mono uppercase tracking-[0.25em] text-[#F5F3EF]/40">
                ATELIER PATRON PORTAL
              </div>
            </div>

            {/* Toggle Right: Shown when in Sign In mode, to switch to Sign Up */}
            <div className="auth-toggle-panel auth-toggle-right">
              <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#F5F3EF]/60 block mb-2">
                CHAPTER // MEMBERSHIP
              </span>
              <h2 className="font-editorial text-4xl lg:text-5xl font-normal tracking-tight uppercase leading-[1.1] text-[#F5F3EF]">
                DISCOVER <br /> NOIR
              </h2>
              <p className="text-xs text-[#F5F3EF]/75 font-light leading-relaxed max-w-xs mt-4 mb-6">
                NOIR is built around movement, precision, and architectural permanence. Join our private patron circle for tailored silhouette reservations and private capsule previews.
              </p>
              <button
                type="button"
                id="register"
                onClick={() => setIsSignUpActive(true)}
                className="auth-btn-ghost"
              >
                CREATE ACCOUNT
              </button>
              <div className="mt-8 text-[9px] font-mono uppercase tracking-[0.25em] text-[#F5F3EF]/40">
                DESIGNED FOR THOSE WHO MOVE DIFFERENTLY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer subtle brand note */}
      <div className="mt-8 text-center text-[10px] text-[#888888] font-mono tracking-[0.25em] uppercase">
        ATELIER NOIR // DESIGNED FOR THOSE WHO MOVE DIFFERENTLY
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center text-xs font-mono text-[#111111] uppercase tracking-widest">
          Loading Atelier Authentication...
        </div>
      }
    >
      <DualAuthPageContent />
    </Suspense>
  );
}
