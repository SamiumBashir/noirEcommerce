"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/context/CartContext";
import { useAuth, UserOrder } from "@/lib/context/AuthContext";
import { formatPrice, formatPriceBdt, USD_TO_BDT_RATE } from "@/lib/utils";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const { user, addOrder, loginDemoPatron } = useAuth();

  // Contact & Delivery Form states
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("+880 1712-345678");
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(" ")[0] : "");
  const [lastName, setLastName] = useState(user?.name ? user.name.split(" ").slice(1).join(" ") : "");
  const [address, setAddress] = useState(user?.addresses?.[0]?.street || "");
  const [city, setCity] = useState(user?.addresses?.[0]?.city || "Dhaka");
  const [state, setState] = useState(user?.addresses?.[0]?.state || "Dhaka Division");
  const [postalCode, setPostalCode] = useState(user?.addresses?.[0]?.postalCode || "1212");
  const [country, setCountry] = useState("Bangladesh");

  // Shipping & Payment Options
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "priority">("standard");
  type PaymentMethodType = "online" | "cod";
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("online");
  const [codInstructions, setCodInstructions] = useState("Call 30 mins before arrival at doorstep");

  // Privilege Promo code
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState("");

  // Processing & Error states
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<UserOrder | null>(null);

  // Auto-fill when patron logs in
  useEffect(() => {
    if (user) {
      if (!email) setEmail(user.email);
      if (!firstName && user.name) setFirstName(user.name.split(" ")[0]);
      if (!lastName && user.name) setLastName(user.name.split(" ").slice(1).join(" "));
      if (user.addresses && user.addresses[0]) {
        if (!address) setAddress(user.addresses[0].street);
        if (!city) setCity(user.addresses[0].city);
        if (!state) setState(user.addresses[0].state);
        if (!postalCode) setPostalCode(user.addresses[0].postalCode);
      }
    }
  }, [user]);

  // Pricing calculations
  const discountAmount = subtotal * appliedDiscount;
  const discountedSubtotal = subtotal - discountAmount;
  const shippingCost = deliveryMethod === "priority" ? 45 : discountedSubtotal >= 250 ? 0 : 25;
  const grandTotal = discountedSubtotal + shippingCost;
  const grandTotalBdt = Math.round(grandTotal * USD_TO_BDT_RATE);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "NOIR10" || promoCode.trim().toUpperCase() === "VIP") {
      setAppliedDiscount(0.1);
      setPromoError("");
    } else {
      setPromoError("Invalid code. Use 'NOIR10' for 10% privilege discount.");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    // Inline validations
    if (!firstName.trim() || !lastName.trim()) {
      setCheckoutError("Please enter both your First Name and Last Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setCheckoutError("Please provide a valid Email Address for tracking and order confirmation.");
      return;
    }
    if (!phone.trim() || phone.length < 6) {
      setCheckoutError("Please provide a contact phone number for delivery verification.");
      return;
    }
    if (!address.trim()) {
      setCheckoutError("Please specify your delivery Street Address.");
      return;
    }
    if (!city.trim()) {
      setCheckoutError("Please enter your delivery City.");
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === "online") {
      // Online Payment via SSLCOMMERZ Official Flow
      try {
        const payload = {
          customerName: `${firstName} ${lastName}`.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || "+8801700000000",
          shippingAddress: {
            street: address.trim(),
            city: city.trim() || "Dhaka",
            state: state.trim() || "Dhaka",
            postalCode: postalCode.trim() || "1212",
            country: country.trim() || "Bangladesh",
          },
          deliveryMethod,
          userId: user?.id,
          items: cart.map((item) => ({
            productId: item.productId || item.product?.id || item.product?.slug,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            name: item.product?.name || "Noir Garment",
            price: item.product?.price,
            image: item.product?.images?.[0] || "",
          })),
        };

        const res = await fetch("/api/payment/sslcommerz/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.gatewayPageUrl) {
          throw new Error(data.error || "Failed to initiate SSLCOMMERZ gateway session.");
        }

        // Redirect customer to SSLCOMMERZ PCI-DSS certified hosted gateway
        window.location.href = data.gatewayPageUrl;
      } catch (err: any) {
        console.error("Payment initiation error:", err);
        setCheckoutError(err.message || "Failed to connect to SSLCOMMERZ gateway. Please try again.");
        setIsProcessing(false);
      }
    } else {
      // Cash on Delivery
      try {
        const payload = {
          customerName: `${firstName} ${lastName}`.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || "+8801700000000",
          shippingAddress: {
            street: address.trim(),
            city: city.trim() || "Dhaka",
            state: state.trim() || "Dhaka",
            postalCode: postalCode.trim() || "1212",
            country: country.trim() || "Bangladesh",
          },
          deliveryMethod,
          paymentMethod: "COD",
          userId: user?.id,
          items: cart.map((item) => ({
            productId: item.productId || item.product?.id || item.product?.slug,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            name: item.product?.name || "Noir Garment",
            price: item.product?.price,
            image: item.product?.images?.[0] || "",
          })),
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to place Cash on Delivery order");
        }

        const newOrder = addOrder({
          total: grandTotal,
          paymentMethod: "Cash on Delivery (Doorstep)",
          transactionId: data.data?.trackingNumber || `COD-${data.data?.orderId || Date.now()}`,
          items: cart.map((item) => ({
            name: item.product.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.product.price,
            image: item.product.images[0],
          })),
        });

        setCreatedOrder(newOrder);
        clearCart();
      } catch (err: any) {
        setCheckoutError(err.message || "Failed to place Cash on Delivery order.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Order Confirmed Receipt Screen (COD or completed orders)
  if (createdOrder) {
    return (
      <div className="w-full min-h-screen bg-[#F5F3EF] pt-28 pb-32 px-6 sm:px-12 md:px-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-[#111111] text-[#F5F3EF] rounded-full flex items-center justify-center mx-auto shadow-xl">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>

          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-emerald-700 block">
            ATELIER ORDER CONFIRMED
          </span>

          <h1 className="font-editorial text-4xl sm:text-5xl font-normal uppercase tracking-tight text-[#111111]">
            Thank You For Moving Differently.
          </h1>

          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed max-w-lg mx-auto font-light">
            Your order has been recorded into our atelier production queue. We have dispatched full tracking details to <strong className="text-[#111111]">{email}</strong>.
          </p>

          <div className="my-8 p-6 bg-[#EAE8E2] border border-[#D8D5CF] text-left space-y-4 shadow-sm">
            <div className="flex justify-between items-baseline border-b border-[#D8D5CF] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#6B6B6B] uppercase block">
                  Order Reference
                </span>
                <span className="text-sm font-semibold tracking-wider text-[#111111]">
                  {createdOrder.id}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#6B6B6B] uppercase block">
                  Tracking Number
                </span>
                <span className="text-xs font-mono text-[#111111]">
                  {createdOrder.trackingNumber}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-[#D8D5CF] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B]">
                  Payment Method
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{createdOrder.paymentMethod}</span>
                </span>
              </div>

              <div className="text-xs text-[#6B6B6B] pt-1 border-t border-[#D8D5CF]/50 flex justify-between">
                <span>Doorstep Payable:</span>
                <span className="font-semibold text-[#111111]">
                  {formatPrice(createdOrder.total)} / ৳{Math.round(createdOrder.total * USD_TO_BDT_RATE).toLocaleString()} BDT
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block">
                Manifest Items:
              </span>
              {createdOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-[#111111]">
                  <span>
                    {item.quantity}x {item.name} ({item.color} / {item.size})
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#D8D5CF] flex justify-between text-sm font-medium text-[#111111]">
              <span>Total Settled</span>
              <div className="text-right">
                <span>{formatPrice(createdOrder.total)}</span>
                <span className="block text-[11px] text-[#6B6B6B] font-mono">
                  ৳{Math.round(createdOrder.total * USD_TO_BDT_RATE).toLocaleString()} BDT
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/account"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
            >
              Track in My Account
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 border border-[#111111] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-black/5 transition-colors"
            >
              Continue Exploring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart guard
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] pt-32 pb-24 px-6 text-center flex flex-col items-center">
        <ShoppingBag className="w-10 h-10 text-[#6B6B6B] mb-4" />
        <h1 className="font-editorial text-3xl uppercase text-[#111111]">
          No garments to checkout
        </h1>
        <p className="text-xs text-[#6B6B6B] mt-2 mb-6">
          Your shopping bag is currently empty.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-28 pb-32 px-6 sm:px-12 md:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Checkout Header */}
        <div className="pb-6 border-b border-[#D8D5CF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="font-editorial tracking-[0.25em] text-2xl font-bold uppercase text-[#111111]"
            >
              NOIR ATELIER
            </Link>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B] block mt-0.5">
              Secure Direct Checkout
            </span>
          </div>
          <span className="text-[11px] uppercase tracking-widest text-[#6B6B6B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SSLCOMMERZ 256-Bit Encrypted Gateways</span>
          </span>
        </div>

        {/* Patron Status & Guest Quick Auth Banner */}
        <div className="my-6">
          {user ? (
            <div className="p-4 bg-[#EAE8E2] border border-[#D8D5CF] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center text-[10px] font-mono">
                  ✓
                </div>
                <div>
                  <span className="text-[#111111] font-medium block">
                    Authenticated Patron: <strong>{user.name}</strong> ({user.email})
                  </span>
                  <span className="text-[11px] text-[#6B6B6B]">
                    Atelier membership perks applied. Order will link to your account dashboard.
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 border border-emerald-200">
                Member Privileges Active
              </span>
            </div>
          ) : (
            <div className="p-4 bg-[#EAE8E2] border border-[#D8D5CF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B] block mb-0.5">
                  Guest Checkout
                </span>
                <span className="text-[#111111]">
                  Fill out your details below to place your order directly.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#6B6B6B] text-[11px]">Have an account?</span>
                <Link
                  href="/login?redirect=/checkout"
                  className="px-3 py-1.5 bg-[#111111] text-[#F5F3EF] text-[11px] uppercase tracking-wider font-medium hover:bg-black transition-colors"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => loginDemoPatron()}
                  className="px-2.5 py-1.5 bg-white border border-[#D8D5CF] text-[#111111] text-[10px] uppercase font-mono tracking-wider hover:bg-black hover:text-white transition-colors"
                >
                  Demo Patron
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Streamlined 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Unified Checkout Details & Options */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-10">
            {/* Section 1: Customer Contact & Delivery Address */}
            <div className="bg-white/60 border border-[#D8D5CF] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D8D5CF]">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center text-xs font-mono font-medium">
                  1
                </span>
                <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                  Contact & Delivery Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander@noir.studio"
                    className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                    Contact Phone (For Courier & SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1712-345678"
                    className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alexander"
                    className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Vance"
                    className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Road 11, House 42, Banani"
                  className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dhaka"
                    className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                    State / Division
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Dhaka Division"
                    className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="1213"
                    className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                  Country / Region
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer"
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="France">France</option>
                </select>
              </div>
            </div>

            {/* Section 2: Delivery Speed */}
            <div className="bg-white/60 border border-[#D8D5CF] p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D8D5CF]">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center text-xs font-mono font-medium">
                  2
                </span>
                <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                  Delivery Method
                </h2>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setDeliveryMethod("standard")}
                  className={`flex items-start justify-between p-4 border cursor-pointer transition-all ${
                    deliveryMethod === "standard"
                      ? "border-[#111111] bg-white ring-1 ring-[#111111]"
                      : "border-[#D8D5CF] bg-[#EAE8E2]/50 hover:border-[#111111]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === "standard"}
                      onChange={() => setDeliveryMethod("standard")}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block">
                        Standard Courier Delivery
                      </span>
                      <span className="text-[11px] text-[#6B6B6B] block mt-0.5">
                        2 - 4 Business Days • Doorstep signature verification
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-[#111111] block">
                      {discountedSubtotal >= 250 ? "Complimentary" : formatPrice(25)}
                    </span>
                    {discountedSubtotal < 250 && (
                      <span className="text-[10px] text-[#6B6B6B] font-mono block">
                        {formatPriceBdt(25)}
                      </span>
                    )}
                  </div>
                </label>

                <label
                  onClick={() => setDeliveryMethod("priority")}
                  className={`flex items-start justify-between p-4 border cursor-pointer transition-all ${
                    deliveryMethod === "priority"
                      ? "border-[#111111] bg-white ring-1 ring-[#111111]"
                      : "border-[#D8D5CF] bg-[#EAE8E2]/50 hover:border-[#111111]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === "priority"}
                      onChange={() => setDeliveryMethod("priority")}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                        <span>Priority Atelier Express</span>
                        <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-mono tracking-widest uppercase">
                          Rush
                        </span>
                      </span>
                      <span className="text-[11px] text-[#6B6B6B] block mt-0.5">
                        Next Business Day • Dedicated hand-delivered garment bag
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-[#111111] block">
                      {formatPrice(45)}
                    </span>
                    <span className="text-[10px] text-[#6B6B6B] font-mono block">
                      {formatPriceBdt(45)}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 3: Payment Method Selection */}
            <div className="bg-white/60 border border-[#D8D5CF] p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D8D5CF]">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center text-xs font-mono font-medium">
                  3
                </span>
                <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                  Payment Method
                </h2>
              </div>

              {/* Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Method 1: Online Payment via SSLCOMMERZ */}
                <div
                  onClick={() => setPaymentMethod("online")}
                  className={`p-5 border cursor-pointer transition-all space-y-3 ${
                    paymentMethod === "online"
                      ? "border-[#111111] bg-white ring-1 ring-[#111111] shadow-sm"
                      : "border-[#D8D5CF] bg-[#EAE8E2]/40 hover:border-[#111111]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center">
                        <CreditCard className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#111111] block">
                          Online Payment
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          SSLCOMMERZ Gateway
                        </span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                    />
                  </div>

                  <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                    Credit/Debit Cards (Visa, MasterCard, Amex), bKash, Nagad, Rocket, Upay, and 30+ Net Banking channels.
                  </p>

                  <div className="pt-2 border-t border-[#D8D5CF]/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#6B6B6B]">Convertible Total:</span>
                    <span className="font-semibold text-[#111111]">
                      ৳{grandTotalBdt.toLocaleString()} BDT
                    </span>
                  </div>
                </div>

                {/* Method 2: Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-5 border cursor-pointer transition-all space-y-3 ${
                    paymentMethod === "cod"
                      ? "border-[#111111] bg-white ring-1 ring-[#111111] shadow-sm"
                      : "border-[#D8D5CF] bg-[#EAE8E2]/40 hover:border-[#111111]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center">
                        <Truck className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#111111] block">
                          Cash on Delivery
                        </span>
                        <span className="text-[10px] text-[#6B6B6B]">
                          Doorstep Settlement
                        </span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                  </div>

                  <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                    Inspect garments upon arrival at your doorstep and settle payment directly in cash with the courier rider.
                  </p>

                  <div className="pt-2 border-t border-[#D8D5CF]/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#6B6B6B]">Pay at Doorstep:</span>
                    <span className="font-semibold text-[#111111]">
                      {formatPrice(grandTotal)} (৳{grandTotalBdt.toLocaleString()})
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic details pane */}
              {paymentMethod === "online" ? (
                <div className="p-4 bg-[#F5F3EF] border border-[#D8D5CF] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B]">
                      Accepted Payment Channels
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      Instant Authorization
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 bg-white border border-[#D8D5CF] text-center">
                      <span className="text-xs font-semibold text-[#111111] block">Cards</span>
                      <span className="text-[9px] text-[#6B6B6B] block">Visa / Master / Amex</span>
                    </div>
                    <div className="p-2 bg-white border border-[#D8D5CF] text-center">
                      <span className="text-xs font-semibold text-[#E2136E] block">bKash</span>
                      <span className="text-[9px] text-[#6B6B6B] block">Instant Checkout</span>
                    </div>
                    <div className="p-2 bg-white border border-[#D8D5CF] text-center">
                      <span className="text-xs font-semibold text-[#F7941D] block">Nagad</span>
                      <span className="text-[9px] text-[#6B6B6B] block">Digital Wallet</span>
                    </div>
                    <div className="p-2 bg-white border border-[#D8D5CF] text-center">
                      <span className="text-xs font-semibold text-[#111111] block">Net Banking</span>
                      <span className="text-[9px] text-[#6B6B6B] block">30+ Local Banks</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white border border-[#D8D5CF] flex items-start gap-2 text-xs text-[#6B6B6B]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Clicking <strong className="text-[#111111]">"Proceed to Secure Payment"</strong> will securely redirect you to the official SSLCOMMERZ gateway to finalize payment. Sensitive details are never stored on our servers.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#F5F3EF] border border-[#D8D5CF] space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                      Courier Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={codInstructions}
                      onChange={(e) => setCodInstructions(e.target.value)}
                      placeholder="e.g. Call 30 mins before arrival, deliver after 3 PM"
                      className="w-full bg-white border border-[#D8D5CF] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <p className="text-[11px] text-[#6B6B6B]">
                    Please ensure the exact cash amount of <strong className="text-[#111111] font-mono">{formatPrice(grandTotal)} (৳{grandTotalBdt.toLocaleString()} BDT)</strong> is ready at your doorstep for the courier rider.
                  </p>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {checkoutError && (
              <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{checkoutError}</p>
              </div>
            )}

            {/* Submit Order Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>
                      {paymentMethod === "online"
                        ? "Connecting to SSLCOMMERZ Gateway..."
                        : "Recording Atelier Order..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentMethod === "online"
                        ? `Proceed to Secure Payment (৳${grandTotalBdt.toLocaleString()} BDT)`
                        : `Confirm Atelier Order (${formatPrice(grandTotal)} / ৳${grandTotalBdt.toLocaleString()})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-[#6B6B6B] mt-2.5">
                By completing your order, you agree to Noir Atelier&apos;s Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-5 sticky top-28 bg-[#EAE8E2]/80 border border-[#D8D5CF] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D5CF]">
              <h3 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                Order Summary
              </h3>
              <span className="text-xs uppercase tracking-wider text-[#6B6B6B]">
                {cart.length} {cart.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* Items list */}
            <div className="divide-y divide-[#D8D5CF] max-h-[320px] overflow-y-auto no-scrollbar space-y-1">
              {cart.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 flex gap-4 items-center">
                  <div className="relative w-14 h-18 bg-white shrink-0 overflow-hidden border border-[#D8D5CF]">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#111111] truncate block">
                      {item.product.name}
                    </span>
                    <span className="text-[11px] text-[#6B6B6B]">
                      {item.color} • {item.size} • Qty {item.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-[#111111] block">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    <span className="text-[10px] text-[#6B6B6B] font-mono block">
                      {formatPriceBdt(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Privilege Code Voucher Input */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5 pt-2 border-t border-[#D8D5CF]">
              <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block">
                Privilege Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Privilege Code (Try: NOIR10)"
                  className="flex-1 bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111] placeholder-[#6B6B6B] focus:outline-none focus:border-[#111111]"
                />
                <button
                  type="submit"
                  className="px-4 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-[11px] text-red-600">{promoError}</p>
              )}
              {appliedDiscount > 0 && (
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <Tag className="w-3 h-3" />
                  VIP Code Applied (-10% off garments)
                </p>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 border-t border-[#D8D5CF] pt-4 text-xs text-[#6B6B6B]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#111111] font-medium">{formatPrice(subtotal)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Privilege Discount (10%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({deliveryMethod === "priority" ? "Priority Express" : "Standard"})</span>
                <span>{shippingCost === 0 ? "Complimentary" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>BDT Conversion Rate</span>
                <span className="font-mono text-[#111111]">1 USD = ৳120 BDT</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Import Duties</span>
                <span>Included</span>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-[#D8D5CF] flex justify-between items-baseline text-base font-semibold text-[#111111]">
                <span>Total Due</span>
                <div className="text-right">
                  <span className="text-2xl font-light block">{formatPrice(grandTotal)}</span>
                  <span className="text-xs text-[#6B6B6B] font-mono block">
                    approx. ৳{grandTotalBdt.toLocaleString()} BDT
                  </span>
                </div>
              </div>
            </div>

            {/* Trust reassurance icons */}
            <div className="pt-4 border-t border-[#D8D5CF] space-y-2 text-[11px] text-[#6B6B6B]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>SSLCOMMERZ 256-Bit Bank Level Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                <span>Complimentary Delivery over $250 / ৳30,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
