"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ArrowRight, UserCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  onSuccess?: () => void;
}

export function AuthRequiredModal({
  isOpen,
  onClose,
  message = "Please sign in or create an account to curate your shopping bag and acquire garments.",
  onSuccess,
}: AuthRequiredModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { loginDemoPatron } = useAuth();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleDemoLogin = async () => {
    setLoadingDemo(true);
    await loginDemoPatron();
    setLoadingDemo(false);
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const loginUrl = `/login?redirect=${encodeURIComponent(pathname || "/shop")}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(pathname || "/shop")}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-[#F5F3EF] border border-[#D8D5CF] p-8 sm:p-10 shadow-2xl z-10 space-y-6"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#6B6B6B] hover:text-[#111111] transition-colors"
              aria-label="Close authentication modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Eyebrow */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-5 h-5 stroke-[1.75]" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#6B6B6B] block">
                ATELIER ACCESS REQUIRED
              </span>
              <h2 className="font-editorial text-3xl uppercase tracking-tight text-[#111111]">
                Sign In to Continue
              </h2>
              <p className="text-xs text-[#6B6B6B] font-light leading-relaxed max-w-sm mx-auto">
                {message}
              </p>
            </div>

            {/* Fast 1-Click Patron Option */}
            <div className="bg-[#EAE8E2]/80 border border-[#D8D5CF] p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#6B6B6B]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
                  INSTANT ATELIER PATRON
                </span>
                <span className="text-emerald-700 font-semibold">1-CLICK</span>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loadingDemo}
                className="w-full py-2.5 bg-[#111111] text-[#F5F3EF] hover:bg-black text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>
                  {loadingDemo ? "Authenticating..." : "Continue as Alexander Vance"}
                </span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#D8D5CF]" />
              <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-[#8E8B82]">
                OR SIGN IN WITH CREDENTIALS
              </span>
              <div className="flex-grow border-t border-[#D8D5CF]" />
            </div>

            {/* Links to Full Login & Register */}
            <div className="space-y-2.5">
              <Link
                href={loginUrl}
                onClick={onClose}
                className="w-full py-3 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F5F3EF] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>Sign In to Existing Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={registerUrl}
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs uppercase tracking-widest text-[#6B6B6B] hover:text-[#111111] transition-colors block underline decoration-dotted"
              >
                Create New Atelier Account
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
