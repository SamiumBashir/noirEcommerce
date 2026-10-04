"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, ShieldCheck, ArrowRight, ShoppingBag, Printer, ExternalLink, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface OrderDetail {
  orderId: string;
  transactionId?: string;
  totalAmount: number;
  payableAmountBdt?: number;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber: string;
  products?: {
    name: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
    image: string;
  }[];
  createdAt?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const tranId = searchParams.get("tranId");
  const { clearCart } = useCart();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear cart upon verified arrival on payment success page
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setOrder(data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch order details:", err))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-32 pb-32 px-6 sm:px-12 md:px-16 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full bg-white border border-[#D8D5CF] shadow-sm p-8 sm:p-14 space-y-8"
      >
        {/* Atelier Badge & Success Icon */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center mx-auto shadow-md">
            <Check className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#6B6B6B] block">
            // TRANSACTION VERIFIED & SETTLED
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl uppercase tracking-tight text-[#111111]">
            Order Confirmed
          </h1>
          <p className="text-xs text-[#6B6B6B] max-w-md mx-auto leading-relaxed">
            Thank you for curating with NOIR Atelier. Your payment has been securely verified via SSLCOMMERZ and your bespoke silhouettes are entering production.
          </p>
        </div>

        {/* Order & Payment Summary Cards */}
        <div className="border-t border-b border-[#D8D5CF] py-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B] block mb-1">
                Order Reference
              </span>
              <span className="font-mono font-medium text-[#111111] break-all">
                {order?.orderId || orderId || "ORD-PROCESSING"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B] block mb-1">
                Transaction ID
              </span>
              <span className="font-mono text-[#111111] break-all">
                {order?.transactionId || tranId || "TXN-VERIFIED"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B] block mb-1">
                Amount Paid
              </span>
              <span className="font-mono font-medium text-[#111111]">
                {order?.totalAmount ? formatPrice(order.totalAmount) : "$--"}
                {order?.payableAmountBdt ? (
                  <span className="text-[10px] text-[#6B6B6B] block font-mono">
                    (৳{order.payableAmountBdt.toLocaleString()} BDT)
                  </span>
                ) : null}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B] block mb-1">
                Client Name
              </span>
              <span className="text-[#111111] font-medium">
                {order?.customerName || "Atelier Patron"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B] block mb-1">
                Payment Channel
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#EAE8E2] border border-[#D8D5CF] text-[10px] font-mono uppercase text-[#111111]">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>SSLCOMMERZ Verified</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B] block mb-1">
                Order Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{order?.orderStatus || "PROCESSING"}</span>
              </span>
            </div>
          </div>

          {/* Garments Preview if loaded */}
          {order?.products && order.products.length > 0 && (
            <div className="pt-4 mt-4 border-t border-[#D8D5CF]/60 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B] block">
                Acquired Silhouettes ({order.products.length})
              </span>
              <div className="divide-y divide-[#D8D5CF]/40">
                {order.products.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <div className="w-9 h-11 relative bg-[#EAE8E2] shrink-0 border border-[#D8D5CF]">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[#111111] uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] text-[#6B6B6B] font-mono">
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[#111111]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security & Tracking Note */}
        <div className="p-4 bg-[#F5F3EF] border border-[#D8D5CF] flex items-start gap-3">
          <Package className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#6B6B6B] space-y-1">
            <p className="font-medium text-[#111111]">Complimentary Atelier Tracking</p>
            <p>
              A formal confirmation receipt with dispatch tracking has been routed to{" "}
              <strong className="text-[#111111] font-mono">{order?.customerEmail || "your email"}</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/account"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            <span>View in Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3.5 border border-[#D8D5CF] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-black/5 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#F5F3EF] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
