"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, RotateCcw, ShoppingBag, ArrowLeft, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const tranId = searchParams.get("tranId");
  const reason = searchParams.get("reason") || "Your bank or the payment processor declined the authorization.";

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  const handleRetryPayment = async () => {
    if (!orderId) {
      router.push("/checkout");
      return;
    }

    setIsRetrying(true);
    setRetryError("");

    try {
      const res = await fetch("/api/payment/sslcommerz/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.gatewayPageUrl) {
        throw new Error(data.error || "Could not restart SSLCOMMERZ checkout session.");
      }

      // Redirect directly to SSLCOMMERZ gateway for the same pending order
      window.location.href = data.gatewayPageUrl;
    } catch (err: any) {
      setIsRetrying(false);
      setRetryError(err.message || "Failed to restart payment. Please try again or return to checkout.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-32 pb-32 px-6 sm:px-12 md:px-16 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full bg-white border border-[#D8D5CF] shadow-sm p-8 sm:p-12 space-y-7"
      >
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-red-600 block">
            // PAYMENT DECLINED
          </span>
          <h1 className="font-editorial text-3xl uppercase tracking-tight text-[#111111]">
            Payment Failed
          </h1>
          <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-md mx-auto">
            The SSLCOMMERZ payment transaction could not be settled. Your garments remain reserved in our atelier while you re-attempt payment.
          </p>
        </div>

        {/* Diagnostic Metadata */}
        <div className="p-4 bg-[#F5F3EF] border border-[#D8D5CF] space-y-2 text-xs">
          {orderId && (
            <div className="flex justify-between items-center text-[#6B6B6B]">
              <span className="font-mono text-[10px] uppercase">Order ID:</span>
              <span className="font-mono font-medium text-[#111111]">{orderId}</span>
            </div>
          )}
          {tranId && (
            <div className="flex justify-between items-center text-[#6B6B6B]">
              <span className="font-mono text-[10px] uppercase">Transaction Ref:</span>
              <span className="font-mono text-[#111111]">{tranId}</span>
            </div>
          )}
          <div className="pt-2 border-t border-[#D8D5CF]/60 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#6B6B6B] leading-snug">
              Notice: <span className="text-[#111111]">{reason}</span>
            </p>
          </div>
        </div>

        {retryError && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">
            {retryError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetryPayment}
            disabled={isRetrying}
            className="w-full py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Preparing Secure Gateway..." : "Try Payment Again"}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/cart"
              className="py-3 border border-[#D8D5CF] text-[#111111] text-xs uppercase tracking-wider font-medium hover:bg-black/5 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Cart</span>
            </Link>

            <Link
              href="/shop"
              className="py-3 border border-[#D8D5CF] text-[#111111] text-xs uppercase tracking-wider font-medium hover:bg-black/5 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#F5F3EF] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
