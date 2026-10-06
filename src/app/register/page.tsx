"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, RotateCcw, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/account";

  const { register, verifyOtp, resendOtp } = useAuth();

  // Registration form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // OTP verification states
  const [step, setStep] = useState<"form" | "otp" | "verified">("form");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const result = await register(name, email, password);
    setLoading(false);

    if (result && !result.success) {
      setErrorMessage(result.error || "Registration failed. Please try again.");
      return;
    }

    if (result?.requiresOtp) {
      setStep("otp");
      setResendCooldown(60);
      if (result.devOtp) {
        setOtp(result.devOtp);
        setOtpSuccessMessage(`A 6-digit code has been dispatched. (Testing code: ${result.devOtp})`);
      } else {
        setOtpSuccessMessage(`A 6-digit code has been dispatched to ${email}.`);
      }
      return;
    }

    router.push(redirectTarget);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setOtpError("Please enter the full 6-digit code.");
      return;
    }

    setOtpError("");
    setOtpLoading(true);

    const result = await verifyOtp(email, cleanOtp);
    setOtpLoading(false);

    if (!result.success) {
      setOtpError(result.error || "Invalid or expired verification code.");
      return;
    }

    // Step 3: Verified & Welcome
    setStep("verified");
    setTimeout(() => {
      router.push(redirectTarget);
    }, 2000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpError("");
    const res = await resendOtp(email);
    if (res.success) {
      if (res.devOtp) {
        setOtp(res.devOtp);
        setOtpSuccessMessage(`A fresh verification code has been dispatched. (Testing code: ${res.devOtp})`);
      } else {
        setOtpSuccessMessage("A fresh verification code has been dispatched.");
      }
      setResendCooldown(60);
    } else {
      setOtpError(res.error || "Failed to resend code.");
    }
  };

  const loginHref = redirectTarget !== "/account"
    ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
    : "/login";

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-32 pb-32 px-6 sm:px-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#EAE8E2]/60 border border-[#D8D5CF] p-8 sm:p-12 shadow-sm space-y-8">
        
        {/* STEP 1: INITIAL REGISTRATION FORM */}
        {step === "form" && (
          <>
            <div className="text-center space-y-2">
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block">
                ATELIER MEMBERSHIP
              </span>
              <h1 className="font-editorial text-4xl uppercase tracking-tight text-[#111111]">
                Create Account
              </h1>
              <p className="text-xs text-[#6B6B6B] font-light">
                Enjoy tailored garment reservations, bespoke sizing notes, and complimentary global express deliveries.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-start gap-2">
                  <span className="font-semibold">&#9888;</span>
                  <span>{errorMessage}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. elena@domain.com"
                  className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
                <span className="text-[10px] text-[#888888] block">Minimum 6 characters required</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                <span>{loading ? "Processing..." : "Create Atelier Account"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="text-center pt-2 text-xs text-[#6B6B6B]">
              <span>Already have an account? </span>
              <Link
                href={loginHref}
                className="text-[#111111] font-semibold underline hover:opacity-80"
              >
                Sign In
              </Link>
            </div>
          </>
        )}

        {/* STEP 2: OTP VERIFICATION VIEW */}
        {step === "otp" && (
          <>
            <div className="text-center space-y-2">
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
                IDENTITY VERIFICATION
              </span>
              <h1 className="font-editorial text-3xl uppercase tracking-tight text-[#111111]">
                Enter Verification Code
              </h1>
              <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">
                We have sent a 6-digit one-time code to <br />
                <span className="font-medium text-[#111111]">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {otpError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-start gap-2">
                  <span className="font-semibold">&#9888;</span>
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccessMessage && !otpError && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{otpSuccessMessage}</span>
                </div>
              )}

              <div className="space-y-2 text-center">
                <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                  className="w-full bg-white border-2 border-[#111111] text-center font-mono text-2xl tracking-[0.5em] py-3 text-[#111111] focus:outline-none shadow-sm"
                />
                <span className="text-[10px] text-[#888888] block">
                  Code expires in 10 minutes
                </span>
              </div>

              <button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="w-full py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>{otpLoading ? "Verifying..." : "Verify & Activate Account"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 flex flex-col items-center gap-3 text-xs text-[#6B6B6B]">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="inline-flex items-center gap-1.5 text-[#111111] hover:underline disabled:opacity-40 disabled:no-underline font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Verification Code"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                    setOtpError("");
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-[#888888] hover:text-[#111111]"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change email address</span>
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3: SUCCESS CELEBRATION */}
        {step === "verified" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="font-editorial text-3xl uppercase tracking-tight text-[#111111]">
              Welcome to NOIR
            </h2>
            <p className="text-xs text-[#6B6B6B] font-light max-w-xs mx-auto leading-relaxed">
              Your account has been authenticated. Check your inbox for our official welcome note. Redirecting to your client dashboard...
            </p>
            <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </div>
        )}

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F3EF] pt-32 text-center text-xs uppercase tracking-widest">Loading Registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
