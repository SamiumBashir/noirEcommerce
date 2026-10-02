"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/account";

  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await register(name, email);
    setLoading(false);
    router.push(redirectTarget);
  };

  const loginHref = redirectTarget !== "/account"
    ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
    : "/login";

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-32 pb-32 px-6 sm:px-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#EAE8E2]/60 border border-[#D8D5CF] p-8 sm:p-12 shadow-sm space-y-8">
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
            <span>{loading ? "Registering..." : "Create Atelier Account"}</span>
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
