"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, RotateCcw, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [user, domain] = email.split("@");
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  const visiblePrefix = user.slice(0, 2);
  return `${visiblePrefix}${"*".repeat(Math.min(user.length - 2, 5))}@${domain}`;
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, resendOtp } = useAuth();

  const queryEmail = searchParams.get("email") || "";
  const queryEmailError = searchParams.get("emailError") || "";
  const redirectTarget = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [dispatchNotice, setDispatchNotice] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize email and dispatchNotice from query param or safe session storage
  useEffect(() => {
    let resolvedEmail = queryEmail;
    if (!resolvedEmail && typeof window !== "undefined") {
      resolvedEmail = sessionStorage.getItem("noir_verification_email") || "";
    }
    if (resolvedEmail) {
      setEmail(resolvedEmail);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("noir_verification_email", resolvedEmail);
      }
    }

    let resolvedError = queryEmailError;
    if (!resolvedError && typeof window !== "undefined") {
      resolvedError = sessionStorage.getItem("noir_verification_email_error") || "";
    }
    if (resolvedError) {
      setDispatchNotice(resolvedError);
    }
  }, [queryEmail, queryEmailError]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/[^0-9]/g, "");
    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    // Handle single digit
    const char = cleaned.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // Auto-advance to next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Jump to previous and clear it
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pastedData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pastedData[i] || "";
    }
    setDigits(nextDigits);

    // Focus last filled index or button
    const targetFocusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[targetFocusIndex]?.focus();
  };

  const fullOtp = digits.join("");

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMessage("Missing email address. Please return to registration.");
      return;
    }

    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    const result = await verifyOtp(email, fullOtp);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Verification failed. Please check the code and try again.");
      return;
    }

    // Success State
    setIsVerified(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("noir_verification_email");
    }

    setTimeout(() => {
      router.push(redirectTarget);
    }, 2200);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading || !email) return;

    setErrorMessage("");
    setSuccessMessage("");
    setResendLoading(true);

    const result = await resendOtp(email);
    setResendLoading(false);

    if (result.success) {
      if (result.emailError) {
        setDispatchNotice(result.emailError);
        setErrorMessage(`Fresh code generated, but email delivery encountered: ${result.emailError}`);
      } else {
        setDispatchNotice("");
        setSuccessMessage("A fresh verification code has been dispatched to your email address.");
      }
      setCooldown(result.retryAfter || 60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setErrorMessage(result.error || "Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-32 pb-32 px-6 sm:px-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#EAE8E2]/60 border border-[#D8D5CF] p-8 sm:p-12 shadow-sm space-y-8">
        
        {/* SUCCESS CELEBRATION VIEW */}
        {isVerified ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block">
              MEMBERSHIP AUTHENTICATED
            </span>
            <h1 className="font-editorial text-3xl uppercase tracking-tight text-[#111111]">
              Welcome to NOIR
            </h1>
            <p className="text-xs text-[#6B6B6B] font-light max-w-xs mx-auto leading-relaxed">
              Your email address has been verified. Our official Welcome note has been dispatched to your inbox. Entering your atelier...
            </p>
            <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="text-center space-y-2">
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
                IDENTITY VERIFICATION
              </span>
              <h1 className="font-editorial text-3xl uppercase tracking-tight text-[#111111]">
                Verify Email
              </h1>
              <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">
                We have transmitted a 6-digit one-time code to:
                <br />
                <span className="font-medium text-[#111111] font-mono tracking-wider">
                  {email ? maskEmail(email) : "your registered email"}
                </span>
              </p>
            </div>

            {/* ALERTS */}
            {dispatchNotice && (
              <div
                role="alert"
                className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-sm space-y-1.5"
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <span>⚠️ Email Delivery Notice:</span>
                  <span className="font-mono text-[11px] bg-amber-100 px-1.5 py-0.5 rounded">{dispatchNotice}</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  If this is on your deployed website (Vercel), please ensure your 16-character Google App Password is added in <strong>Vercel Project Settings &gt; Environment Variables &gt; SMTP_PASS</strong> and redeploy.
                </p>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-start gap-2.5"
              >
                <span className="font-semibold">&#9888;</span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && !errorMessage && (
              <div
                role="status"
                className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* OTP FORM */}
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block text-center">
                  Enter 6-Digit Passcode
                </label>
                
                {/* 6-DIGIT INDIVIDUAL INPUT BOXES (Supports keyboard, backspace, paste) */}
                <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      aria-label={`Digit ${index + 1} of 6`}
                      className="w-11 h-13 sm:w-12 sm:h-14 bg-white border border-[#D8D5CF] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-center font-mono text-xl sm:text-2xl text-[#111111] outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                <span className="text-[10px] text-[#888888] block text-center">
                  Passcode expires in 10 minutes
                </span>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading || fullOtp.length !== 6}
                className="w-full py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black disabled:opacity-40 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{loading ? "Verifying Passcode..." : "Verify & Activate Account"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* COOLDOWN & RESEND */}
              <div className="pt-2 flex flex-col items-center gap-3 text-xs text-[#6B6B6B]">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resendLoading}
                  className="inline-flex items-center gap-1.5 text-[#111111] hover:underline disabled:opacity-40 disabled:no-underline font-medium cursor-pointer disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`w-3 h-3 ${resendLoading ? "animate-spin" : ""}`} />
                  <span>
                    {cooldown > 0
                      ? `Resend code in ${cooldown}s`
                      : resendLoading
                      ? "Dispatched..."
                      : "Resend Verification Code"}
                  </span>
                </button>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 text-[11px] text-[#888888] hover:text-[#111111] pt-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Return to registration</span>
                </Link>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F3EF] pt-32 text-center text-xs uppercase tracking-widest">
          Loading Email Verification...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
