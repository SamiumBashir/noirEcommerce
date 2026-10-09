"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/account";
  const isDeactivated = searchParams.get("deactivated") === "true";

  const { login, loginDemoPatron } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const isAdminEmail = email.toLowerCase().includes("admin");
    const result = await login(email, password, isAdminEmail ? "admin" : "customer");

    setLoading(false);

    if (result && !result.success) {
      if (result.requiresVerification) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("noir_verification_email", result.email || email);
        }
        router.push(
          `/verify-email?email=${encodeURIComponent(result.email || email)}&redirect=${encodeURIComponent(redirectTarget)}`
        );
        return;
      }
      setErrorMessage(result.error || "Authentication failed. Please verify your credentials.");
      return;
    }

    if (isAdminEmail) {
      router.push("/admin");
    } else {
      router.push(redirectTarget);
    }
  };

  const handleDemoCustomer = async () => {
    setErrorMessage("");
    setLoading(true);
    await loginDemoPatron();
    setLoading(false);
    router.push(redirectTarget);
  };

  const registerHref = redirectTarget !== "/account" 
    ? `/register?redirect=${encodeURIComponent(redirectTarget)}` 
    : "/register";

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-32 pb-32 px-6 sm:px-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#EAE8E2]/60 border border-[#D8D5CF] p-8 sm:p-12 shadow-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block">
            CLIENT PORTAL
          </span>
          <h1 className="font-editorial text-4xl uppercase tracking-tight text-[#111111]">
            Sign In to NOIR
          </h1>
          <p className="text-xs text-[#6B6B6B] font-light">
            Access your private atelier orders, saved measurements, and archival wishlist.
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block text-center font-mono">
            // FAST CLIENT ACCESS
          </span>
          <button
            type="button"
            onClick={handleDemoCustomer}
            disabled={loading}
            className="w-full py-2.5 bg-[#111111] text-[#F5F3EF] hover:bg-black text-xs uppercase tracking-wider transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span>Continue as Guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#D8D5CF]" />
          <span className="flex-shrink mx-4 text-[10px] font-mono uppercase text-[#6B6B6B]">
            OR SIGN IN WITH EMAIL
          </span>
          <div className="flex-grow border-t border-[#D8D5CF]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isDeactivated && (
            <div className="p-3 bg-neutral-900 text-[#F5F3EF] border border-[#111111] text-xs rounded-sm flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold">&#10003;</span>
              <span className="leading-relaxed">
                Your NOIR Atelier account has been deactivated. An official confirmation email has been dispatched to your inbox.
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-start gap-2">
              <span className="font-semibold">&#9888;</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. client@domain.com"
              className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B]">
                Password
              </label>
              <a href="#" className="text-[11px] text-[#6B6B6B] hover:text-[#111111] underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#6B6B6B]">
          <span>New to the atelier? </span>
          <Link
            href={registerHref}
            className="text-[#111111] font-semibold underline hover:opacity-80"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F3EF] pt-32 text-center text-xs uppercase tracking-widest">Loading Client Portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
