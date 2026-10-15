"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Eye, EyeOff, User, Mail, Check, AlertCircle } from "lucide-react";
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

export interface SocialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: "google" | "apple";
  mode: "register" | "signin";
  prefillName?: string;
  prefillEmail?: string;
  prefillPassword?: string;
  onSuccess: () => void;
}

export function SocialAuthModal({
  isOpen,
  onClose,
  provider,
  mode,
  prefillName = "",
  prefillEmail = "",
  prefillPassword = "",
  onSuccess,
}: SocialAuthModalProps) {
  const { socialAuth } = useAuth();

  // Selected account type: "prefill" | "demo" | "custom"
  const [accountType, setAccountType] = useState<"prefill" | "demo" | "custom">(
    prefillEmail ? "prefill" : "demo"
  );

  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [password, setPassword] = useState(prefillPassword || "noir2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when modal opens or prefill changes
  useEffect(() => {
    if (isOpen) {
      setError("");
      setLoading(false);
      if (prefillEmail) {
        setAccountType("prefill");
      } else {
        setAccountType("demo");
      }
      if (prefillPassword) {
        setPassword(prefillPassword);
      } else {
        setPassword("noir2026");
      }
    }
  }, [isOpen, prefillEmail, prefillPassword]);

  if (!isOpen || !mounted) return null;

  // Determine active profile details
  let activeName = "";
  let activeEmail = "";

  if (accountType === "prefill") {
    activeName = prefillName || "Patron";
    activeEmail = prefillEmail;
  } else if (accountType === "demo") {
    activeName = "Alexander Vance";
    activeEmail = "alexander@noir.studio";
  } else {
    activeName = customName.trim();
    activeEmail = customEmail.trim();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!activeEmail) {
      setError("Please select or enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(activeEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Security passkey must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await socialAuth({
        provider,
        name: activeName || activeEmail.split("@")[0].toUpperCase(),
        email: activeEmail,
        password,
      });

      setLoading(false);

      if (result && !result.success) {
        setError(result.error || "Authentication failed. Please try again.");
        return;
      }

      onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "An unexpected error occurred.");
    }
  };

  const providerLabel = provider === "apple" ? "Apple ID" : "Google";

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#FAF9F6] border border-[#111111]/20 shadow-2xl relative overflow-hidden transition-all duration-300 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Border Accent */}
        <div className="h-1 bg-[#111111] w-full" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#888888] hover:text-[#111111] p-1.5 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            {provider === "apple" ? <AppleIcon /> : <GoogleIcon />}
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666666]">
              Atelier Social Authentication
            </span>
          </div>

          <h3 className="font-editorial text-2xl tracking-[0.04em] text-[#111111] uppercase font-light">
            {mode === "register" ? `Register with ${providerLabel}` : `Sign in with ${providerLabel}`}
          </h3>
          <p className="text-xs text-[#6B6B6B] mt-1 mb-6 leading-relaxed">
            Select your account and set a security passkey for full atelier access.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 bg-red-50/90 border border-red-200/80 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Account Selector */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#666666] block font-mono font-medium mb-2.5">
                1. Select Account
              </label>

              <div className="space-y-2">
                {/* Option A: Prefilled Account (if user entered email in main form) */}
                {prefillEmail && (
                  <div
                    onClick={() => setAccountType("prefill")}
                    className={`p-3 border transition-all cursor-pointer flex items-center justify-between ${
                      accountType === "prefill"
                        ? "border-[#111111] bg-white shadow-sm"
                        : "border-[#E2DFD8] bg-[#F4F2EC]/60 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#111111] text-[#FAF9F6] text-xs font-mono font-medium flex items-center justify-center shrink-0 uppercase">
                        {(prefillName || prefillEmail)[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#111111] truncate">
                          {prefillName || "Patron Account"}
                        </div>
                        <div className="text-[11px] text-[#666666] font-mono truncate">
                          {prefillEmail}
                        </div>
                      </div>
                    </div>
                    {accountType === "prefill" && (
                      <div className="w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                )}

                {/* Option B: Alexander Vance Demo Patron */}
                <div
                  onClick={() => setAccountType("demo")}
                  className={`p-3 border transition-all cursor-pointer flex items-center justify-between ${
                    accountType === "demo"
                      ? "border-[#111111] bg-white shadow-sm"
                      : "border-[#E2DFD8] bg-[#F4F2EC]/60 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#333333] text-[#FAF9F6] text-xs font-mono font-medium flex items-center justify-center shrink-0 uppercase">
                      AV
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#111111]">
                          Alexander Vance
                        </span>
                        <span className="text-[9px] uppercase tracking-wider bg-[#111111]/10 px-1.5 py-0.5 text-[#111111] font-mono">
                          Curator
                        </span>
                      </div>
                      <div className="text-[11px] text-[#666666] font-mono truncate">
                        alexander@noir.studio
                      </div>
                    </div>
                  </div>
                  {accountType === "demo" && (
                    <div className="w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Option C: Custom Account */}
                <div
                  onClick={() => setAccountType("custom")}
                  className={`p-3 border transition-all cursor-pointer flex items-center justify-between ${
                    accountType === "custom"
                      ? "border-[#111111] bg-white shadow-sm"
                      : "border-[#E2DFD8] bg-[#F4F2EC]/60 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-dashed border-[#888888] text-[#666666] flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-mono text-[#333333]">
                      + Use another {providerLabel} account
                    </div>
                  </div>
                  {accountType === "custom" && (
                    <div className="w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Custom Account Input Fields */}
                {accountType === "custom" && (
                  <div className="p-3 bg-white border border-[#111111]/20 space-y-2.5 animate-fade-in mt-2">
                    <div>
                      <label className="text-[9px] uppercase font-mono tracking-wider text-[#777777] block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Sabina Iasmin"
                        className="w-full bg-[#FAF9F6] border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono tracking-wider text-[#777777] block mb-1">
                        {providerLabel} Email Address
                      </label>
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder={`name@${provider === "apple" ? "icloud.com" : "gmail.com"}`}
                        className="w-full bg-[#FAF9F6] border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Passkey / Password Configuration */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#666666] block font-mono font-medium">
                  2. Security Passkey
                </label>
                <span className="text-[9px] text-[#888888] font-mono">
                  Min 6 characters
                </span>
              </div>
              <p className="text-[11px] text-[#777777] mb-2 leading-tight">
                Assign a password so you can also sign in directly via email & passkey anytime.
              </p>

              <div className="relative">
                <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full bg-white border border-[#D8D5CF] pl-10 pr-11 py-2.5 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] p-1 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#111111] hover:bg-black text-[#F5F3EF] text-[11px] uppercase tracking-[0.2em] font-medium transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 font-mono shadow-sm"
              >
                {provider === "apple" ? (
                  <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.66-.82 1.11-1.95.99-3.09-.95.04-2.1.64-2.77 1.43-.59.68-1.11 1.78-.97 2.87 1.06.08 2.09-.39 2.75-1.21" />
                  </svg>
                ) : (
                  <GoogleIcon />
                )}
                <span>
                  {loading
                    ? "Authenticating..."
                    : `Continue as ${activeName || "Patron"}`}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full mt-2 py-2 text-[10px] uppercase font-mono tracking-wider text-[#777777] hover:text-[#111111] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
