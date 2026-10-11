"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [user, domain] = email.split("@");
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  const visiblePrefix = user.slice(0, 2);
  return `${visiblePrefix}${"*".repeat(Math.min(user.length - 2, 5))}@${domain}`;
}

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { forgotPassword, verifyResetOtp, resendResetOtp, resetPassword } = useAuth();

  // Navigation & Step state
  const [step, setStep] = useState<Step>("EMAIL");

  // Step 1: Email Form State
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailGenericNotice, setEmailGenericNotice] = useState("");

  // Step 2: OTP Verification State
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [devOtp, setDevOtp] = useState<string>("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: New Password State (resetToken kept in ephemeral component memory only)
  const [resetToken, setResetToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0 && step === "OTP") {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown, step]);

  // Focus management on step change
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Client email validation
  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  // ----------------------------------------------------
  // STEP 1: Request OTP Handlers
  // ----------------------------------------------------
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailGenericNotice("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setEmailError("Please enter your registered client email address.");
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setEmailError("Please provide a valid email format (e.g. patron@noir.studio).");
      return;
    }

    setEmailLoading(true);
    const result = await forgotPassword(cleanEmail);
    setEmailLoading(false);

    if (!result.success) {
      setEmailError(result.error || "Unable to dispatch recovery passcode. Please try again.");
      return;
    }

    // Generic success message to protect privacy
    setEmailGenericNotice(
      result.message || "If an account exists for this email address, a password reset code will be sent shortly."
    );
    setCooldown(60);
    setDigits(["", "", "", "", "", ""]);
    setOtpError("");
    setResendSuccess("");
    if (result.devOtp) {
      setDevOtp(result.devOtp);
    }

    // Transition to OTP verification step
    setStep("OTP");
  };

  // ----------------------------------------------------
  // STEP 2: OTP Handlers
  // ----------------------------------------------------
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    // Support mobile autocomplete or pasting multiple digits into single input
    if (cleaned.length > 1) {
      const nextDigits = [...digits];
      for (let i = 0; i < cleaned.length && index + i < 6; i++) {
        nextDigits[index + i] = cleaned[i];
      }
      setDigits(nextDigits);
      const targetFocus = Math.min(index + cleaned.length, 5);
      otpInputRefs.current[targetFocus]?.focus();
      return;
    }

    const char = cleaned.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    if (index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0 && otpInputRefs.current[index - 1]) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || "";
    }
    setDigits(nextDigits);

    const targetFocus = Math.min(pasted.length, 5);
    otpInputRefs.current[targetFocus]?.focus();
  };

  const fullOtp = digits.join("");

  const handleOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError("");
    setResendSuccess("");

    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 numeric digits of your verification passcode.");
      return;
    }

    setOtpLoading(true);
    const result = await verifyResetOtp(email.trim().toLowerCase(), fullOtp);
    setOtpLoading(false);

    if (!result.success || !result.resetToken) {
      setOtpError(result.error || "Passcode verification failed. Please check the code and try again.");
      return;
    }

    // Retain token in ephemeral component state
    setResetToken(result.resetToken);
    setStep("NEW_PASSWORD");
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading || !email) return;

    setOtpError("");
    setResendSuccess("");
    setResendLoading(true);

    const result = await resendResetOtp(email.trim().toLowerCase());
    setResendLoading(false);

    if (result.success) {
      setResendSuccess("A fresh verification passcode has been dispatched to your email address.");
      setCooldown(result.retryAfter || 60);
      if (result.devOtp) setDevOtp(result.devOtp);
      setDigits(["", "", "", "", "", ""]);
      setAttemptsRemaining(null);
      otpInputRefs.current[0]?.focus();
    } else {
      if (result.retryAfter) setCooldown(result.retryAfter);
      setOtpError(result.error || "Unable to resend passcode. Please try again shortly.");
    }
  };

  // Restart flow
  const handleRestart = () => {
    setResetToken("");
    setDigits(["", "", "", "", "", ""]);
    setDevOtp("");
    setOtpError("");
    setResendSuccess("");
    setEmailError("");
    setEmailGenericNotice("");
    setPasswordError("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("EMAIL");
  };

  // ----------------------------------------------------
  // STEP 3: New Password Submission
  // ----------------------------------------------------
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!resetToken) {
      setPasswordError("Reset authorization has expired or is missing. Please restart recovery.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Passkey must contain at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("Passkey must contain at least one uppercase letter (A-Z).");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("Passkey must contain at least one numeric digit (0-9).");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passkey confirmation does not match. Please re-enter.");
      return;
    }

    setPasswordLoading(true);
    const result = await resetPassword(resetToken, newPassword);
    setPasswordLoading(false);

    if (!result.success) {
      setPasswordError(result.error || "Failed to update security passkey. The token may have expired.");
      return;
    }

    // Clear resetToken from memory immediately
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("SUCCESS");
  };

  return (
    <div className="auth-slider-body font-sans">
      {/* Top Floating Utility Header */}
      <div className="w-full max-w-[540px] mx-auto mb-6 px-4 flex items-center justify-between text-[#111111]">
        <Link
          href="/login"
          className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#111111] transition-colors inline-flex items-center gap-2 font-mono font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
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

      {/* Main Card */}
      <div className="w-full max-w-[500px] mx-auto bg-white border border-[#D8D5CF] p-7 sm:p-10 shadow-[0_20px_50px_rgba(17,17,17,0.06)] relative overflow-hidden">
        {/* Step Indicator Progress Bar */}
        <div className="w-full grid grid-cols-4 gap-1.5 mb-8">
          <div
            className={`h-1 transition-colors duration-500 ${
              step === "EMAIL" || step === "OTP" || step === "NEW_PASSWORD" || step === "SUCCESS"
                ? "bg-[#111111]"
                : "bg-[#EAE8E2]"
            }`}
          />
          <div
            className={`h-1 transition-colors duration-500 ${
              step === "OTP" || step === "NEW_PASSWORD" || step === "SUCCESS"
                ? "bg-[#111111]"
                : "bg-[#EAE8E2]"
            }`}
          />
          <div
            className={`h-1 transition-colors duration-500 ${
              step === "NEW_PASSWORD" || step === "SUCCESS" ? "bg-[#111111]" : "bg-[#EAE8E2]"
            }`}
          />
          <div
            className={`h-1 transition-colors duration-500 ${
              step === "SUCCESS" ? "bg-emerald-600" : "bg-[#EAE8E2]"
            }`}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* STEP 1: REQUEST OTP VIA REGISTERED EMAIL                 */}
          {/* ======================================================== */}
          {step === "EMAIL" && (
            <motion.div
              key="step-email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F5F3EF] border border-[#E2DFD8] text-[9px] uppercase font-mono tracking-[0.25em] text-[#555555]">
                  <KeyRound className="w-3 h-3 text-[#111111]" />
                  <span>Passkey Recovery</span>
                </div>
                <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight uppercase">
                  Reset Passkey
                </h1>
                <p className="text-xs text-[#6B6B6B] font-light leading-relaxed max-w-sm mx-auto">
                  Enter your registered client email. We will transmit a single-use authorization passcode to authenticate your identity.
                </p>
              </div>

              {emailError && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span className="leading-relaxed">{emailError}</span>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label htmlFor="recovery-email" className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#666666] block">
                    Client Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@noir.studio"
                      autoComplete="email"
                      className="w-full bg-[#FAF9F6] border border-[#D8D5CF] pl-10 pr-4 py-3 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-3.5 bg-[#111111] hover:bg-black text-[#F5F3EF] text-[11px] uppercase tracking-[0.2em] font-medium transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 font-mono mt-2"
                >
                  {emailLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#F5F3EF] border-t-transparent rounded-full animate-spin" />
                      <span>Dispatching Passcode...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Dispatch Passcode</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-xs text-[#6B6B6B] hover:text-[#111111] inline-flex items-center gap-1.5 transition-colors font-mono uppercase tracking-wider text-[11px]"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Remember your passkey? Sign In</span>
                </Link>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: VERIFY 6-DIGIT PASSCODE                          */}
          {/* ======================================================== */}
          {step === "OTP" && (
            <motion.div
              key="step-otp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F5F3EF] border border-[#E2DFD8] text-[9px] uppercase font-mono tracking-[0.25em] text-[#555555]">
                  <ShieldCheck className="w-3 h-3 text-[#111111]" />
                  <span>Security Handshake</span>
                </div>
                <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight uppercase">
                  Verify Passcode
                </h1>
                <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">
                  Enter the 6-digit authorization code dispatched to:
                  <br />
                  <span className="font-medium text-[#111111] font-mono tracking-wider">
                    {maskEmail(email)}
                  </span>
                </p>
              </div>

              {emailGenericNotice && (
                <div
                  role="status"
                  className="p-3 bg-[#F5F3EF] border border-[#D8D5CF] text-[#444444] text-[11px] flex items-start gap-2 text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-mono">{emailGenericNotice}</span>
                </div>
              )}

              {otpError && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span className="leading-relaxed">{otpError}</span>
                </div>
              )}

              {resendSuccess && (
                <div
                  role="status"
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 text-left"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{resendSuccess}</span>
                </div>
              )}

              {devOtp && (
                <div className="p-3 bg-[#111111] text-[#F5F3EF] border border-[#333333] text-[11px] font-mono flex items-center justify-between">
                  <span className="text-[#888888] tracking-widest text-[10px]">LOCAL DEV PASSCODE:</span>
                  <span className="tracking-[0.25em] font-bold text-emerald-400 text-sm">{devOtp}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#666666] block text-center">
                    6-Digit Authorization Passcode
                  </label>

                  {/* 6 Digit Numeric Inputs */}
                  <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                    {digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpInputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        aria-label={`Digit ${index + 1} of 6`}
                        className="w-10 h-12 sm:w-12 sm:h-14 bg-[#FAF9F6] border border-[#D8D5CF] focus:border-[#111111] focus:bg-white text-center font-mono text-xl sm:text-2xl text-[#111111] outline-none transition-all shadow-none"
                      />
                    ))}
                  </div>

                  <span className="text-[10px] text-[#888888] block text-center font-mono tracking-wider">
                    Passcode valid for 10 minutes (max 5 verification attempts)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || fullOtp.length !== 6}
                  className="w-full py-3.5 bg-[#111111] hover:bg-black text-[#F5F3EF] text-[11px] uppercase tracking-[0.2em] font-medium transition-all active:scale-[0.99] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
                >
                  {otpLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#F5F3EF] border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Passcode...</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize Passcode</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Cooldown & Flow Actions */}
              <div className="pt-2 flex flex-col items-center gap-3 text-xs text-[#6B6B6B]">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resendLoading}
                  className="inline-flex items-center gap-1.5 text-[#111111] hover:underline disabled:opacity-40 disabled:no-underline font-mono text-[11px] uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`w-3 h-3 ${resendLoading ? "animate-spin" : ""}`} />
                  <span>
                    {cooldown > 0
                      ? `Resend passcode in ${cooldown}s`
                      : resendLoading
                      ? "Dispatching..."
                      : "Resend Passcode"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="text-[11px] text-[#888888] hover:text-[#111111] font-mono uppercase tracking-wider underline underline-offset-4 transition-colors"
                >
                  Use a different email address
                </button>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: CONFIGURE NEW PASSKEY                            */}
          {/* ======================================================== */}
          {step === "NEW_PASSWORD" && (
            <motion.div
              key="step-new-password"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F5F3EF] border border-[#E2DFD8] text-[9px] uppercase font-mono tracking-[0.25em] text-[#555555]">
                  <KeyRound className="w-3 h-3 text-[#111111]" />
                  <span>Credential Rotation</span>
                </div>
                <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight uppercase">
                  New Passkey
                </h1>
                <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">
                  Identity verified. Enter a secure passkey to replace your prior atelier credentials.
                </p>
              </div>

              {passwordError && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 text-left"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <div className="space-y-1">
                    <span className="leading-relaxed block">{passwordError}</span>
                    {passwordError.toLowerCase().includes("expired") && (
                      <button
                        type="button"
                        onClick={handleRestart}
                        className="text-[11px] underline font-mono uppercase text-red-900 hover:text-black"
                      >
                        Restart Passkey Recovery
                      </button>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label htmlFor="new-passkey" className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#666666] block">
                    New Security Passkey
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="new-passkey"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      className="w-full bg-[#FAF9F6] border border-[#D8D5CF] pl-10 pr-11 py-3 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] p-1 transition-colors"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label htmlFor="confirm-passkey" className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#666666] block">
                    Confirm Security Passkey
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="confirm-passkey"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      className="w-full bg-[#FAF9F6] border border-[#D8D5CF] pl-10 pr-11 py-3 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] p-1 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Policy Requirements Checklist */}
                <div className="p-3 bg-[#FAF9F6] border border-[#E2DFD8] text-[10px] font-mono text-[#666666] space-y-1 text-left">
                  <div className="text-[9px] uppercase tracking-wider text-[#333333] font-medium mb-1">
                    Security Requirements
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={newPassword.length >= 8 ? "text-emerald-600 font-bold" : "text-[#999999]"}>
                      {newPassword.length >= 8 ? "✓" : "○"}
                    </span>
                    <span>At least 8 characters in length</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={/[A-Z]/.test(newPassword) ? "text-emerald-600 font-bold" : "text-[#999999]"}>
                      {/[A-Z]/.test(newPassword) ? "✓" : "○"}
                    </span>
                    <span>At least one uppercase letter (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={/[0-9]/.test(newPassword) ? "text-emerald-600 font-bold" : "text-[#999999]"}>
                      {/[0-9]/.test(newPassword) ? "✓" : "○"}
                    </span>
                    <span>At least one numeric digit (0-9)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        confirmPassword && newPassword === confirmPassword
                          ? "text-emerald-600 font-bold"
                          : "text-[#999999]"
                      }
                    >
                      {confirmPassword && newPassword === confirmPassword ? "✓" : "○"}
                    </span>
                    <span>Confirmation matches passkey</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3.5 bg-[#111111] hover:bg-black text-[#F5F3EF] text-[11px] uppercase tracking-[0.2em] font-medium transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 font-mono mt-2"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#F5F3EF] border-t-transparent rounded-full animate-spin" />
                      <span>Securing Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Update Passkey</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: SUCCESS CONFIRMATION                             */}
          {/* ======================================================== */}
          {step === "SUCCESS" && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-4 space-y-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block font-mono">
                  CREDENTIALS SECURED
                </span>
                <h1 className="font-editorial text-3xl sm:text-4xl uppercase tracking-tight text-[#111111]">
                  Passkey Updated
                </h1>
                <p className="text-xs text-[#6B6B6B] font-light max-w-xs mx-auto leading-relaxed">
                  Your atelier security passkey has been renewed. Existing active sessions have been safely terminated for your protection.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3.5 bg-[#111111] hover:bg-black text-[#F5F3EF] text-[11px] uppercase tracking-[0.2em] font-medium transition-all inline-flex items-center justify-center gap-2 font-mono"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticate & Enter Atelier</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer reassurance */}
      <div className="mt-8 text-center text-[10px] text-[#888888] font-mono tracking-wider uppercase">
        NOIR Atelier &bull; Cryptographic Zero-Trust Protocol &bull; 2026
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F3EF] pt-32 text-center text-xs uppercase tracking-widest font-mono">
          Loading Security Protocol...
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
