"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Smartphone,
  Banknote,
  Lock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Wallet,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/context/CartContext";
import { useAuth, UserOrder } from "@/lib/context/AuthContext";
import { formatPrice } from "@/lib/utils";

type CheckoutStep = 1 | 2 | 3 | 4 | 5;

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const { user, addOrder, loginDemoPatron } = useAuth();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Form states
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState(user?.name.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name.split(" ")[1] || "");
  const [address, setAddress] = useState(user?.addresses[0]?.street || "");
  const [city, setCity] = useState(user?.addresses[0]?.city || "");
  const [state, setState] = useState(user?.addresses[0]?.state || "");
  const [postalCode, setPostalCode] = useState(user?.addresses[0]?.postalCode || "");
  const [country, setCountry] = useState("United States");

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "priority">("standard");

  type PaymentGateway = "card" | "bkash" | "nagad" | "applepay" | "cod";
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>("card");

  // Card payment state
  const [cardNumber, setCardNumber] = useState("4532 8820 9182 8892");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("742");
  const [cardName, setCardName] = useState(user?.name || "Alexander Vance");
  const [cardBrand, setCardBrand] = useState<"visa" | "mastercard" | "amex">("visa");

  // bKash payment state
  const [bkashNumber, setBkashNumber] = useState("01712345678");
  const [bkashOtp, setBkashOtp] = useState("482910");
  const [bkashPin, setBkashPin] = useState("•••••");
  const [bkashOtpNotice, setBkashOtpNotice] = useState("");

  // Nagad payment state
  const [nagadNumber, setNagadNumber] = useState("01987654321");
  const [nagadOtp, setNagadOtp] = useState("783921");
  const [nagadPin, setNagadPin] = useState("••••");
  const [nagadOtpNotice, setNagadOtpNotice] = useState("");

  // Apple Pay / Google Pay state
  const [walletType, setWalletType] = useState<"apple" | "google">("apple");
  const [biometricStatus, setBiometricStatus] = useState<"idle" | "scanning" | "verified">("verified");

  // Cash on Delivery state
  const [codPhone, setCodPhone] = useState("+880 1712-345678");
  const [codInstructions, setCodInstructions] = useState("Call 30 mins before arrival at doorstep");
  const [codAgreed, setCodAgreed] = useState(true);

  const [createdOrder, setCreatedOrder] = useState<UserOrder | null>(null);

  // Auto-fill from user profile
  React.useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstName(user.name.split(" ")[0] || "");
      setLastName(user.name.split(" ")[1] || "");
      if (user.addresses && user.addresses[0]) {
        setAddress(user.addresses[0].street);
        setCity(user.addresses[0].city);
        setState(user.addresses[0].state);
        setPostalCode(user.addresses[0].postalCode);
      }
      setCardName(user.name);
    }
  }, [user]);

  const shippingCost = deliveryMethod === "priority" ? 45 : subtotal >= 250 ? 0 : 25;
  const grandTotal = subtotal + shippingCost;
  const BDT_RATE = 120;
  const grandTotalBdt = Math.round(grandTotal * BDT_RATE);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as CheckoutStep);
    } else if (currentStep === 4) {
      // Determine payment metadata based on selected gateway
      let paymentMethodStr = "";
      let transactionIdStr = "";

      if (paymentGateway === "card") {
        const last4 = cardNumber.replace(/\D/g, "").slice(-4) || "8892";
        const brandName = cardBrand === "visa" ? "Visa" : cardBrand === "mastercard" ? "Mastercard" : "Amex";
        paymentMethodStr = `${brandName} (•••• ${last4})`;
        transactionIdStr = `TXN-CC-${Math.floor(100000 + Math.random() * 900000)}`;
      } else if (paymentGateway === "bkash") {
        const formattedPhone = bkashNumber.length >= 7
          ? `${bkashNumber.slice(0, 3)}••••${bkashNumber.slice(-3)}`
          : bkashNumber;
        paymentMethodStr = `bKash Wallet (${formattedPhone})`;
        transactionIdStr = `TRX-${Math.random().toString(36).substring(2, 8).toUpperCase()}-BK`;
      } else if (paymentGateway === "nagad") {
        const formattedPhone = nagadNumber.length >= 7
          ? `${nagadNumber.slice(0, 3)}••••${nagadNumber.slice(-3)}`
          : nagadNumber;
        paymentMethodStr = `Nagad Wallet (${formattedPhone})`;
        transactionIdStr = `NGD-${Math.random().toString(36).substring(2, 8).toUpperCase()}-BD`;
      } else if (paymentGateway === "applepay") {
        paymentMethodStr = walletType === "apple" ? "Apple Pay (Biometric)" : "Google Pay (1-Click)";
        transactionIdStr = `WAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      } else if (paymentGateway === "cod") {
        paymentMethodStr = "Cash on Delivery (Doorstep)";
        transactionIdStr = `COD-${Math.floor(1000 + Math.random() * 9000)}-COLLECT`;
      }

      // Place Order
      const newOrder = addOrder({
        total: grandTotal,
        paymentMethod: paymentMethodStr,
        transactionId: transactionIdStr,
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
      setCurrentStep(5);
    }
  };

  const steps = [
    { num: 1, label: "Information" },
    { num: 2, label: "Shipping" },
    { num: 3, label: "Delivery" },
    { num: 4, label: "Payment" },
    { num: 5, label: "Confirmation" },
  ];

  if (!user && currentStep !== 5) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] pt-36 pb-24 px-6 text-center flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-[#EAE8E2]/80 border border-[#D8D5CF] p-8 sm:p-12 shadow-sm space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#6B6B6B] block mb-1">
              CURATOR CHECKOUT GATE
            </span>
            <h1 className="font-editorial text-3xl uppercase text-[#111111]">
              Sign In Required to Buy
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-2 font-light leading-relaxed">
              To finalize your atelier order and receive tracking updates, an authenticated client membership is required.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/checkout"
              className="w-full py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <span>Sign In to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/register?redirect=/checkout"
              className="w-full py-3 border border-[#111111] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-[#111111] hover:text-[#F5F3EF] transition-colors block text-center"
            >
              Create Atelier Account
            </Link>

            <button
              onClick={() => loginDemoPatron()}
              className="w-full py-2.5 bg-white border border-[#D8D5CF] text-[#111111] hover:bg-[#111111] hover:text-[#F5F3EF] text-[11px] uppercase tracking-wider font-mono transition-colors"
            >
              // 1-Click Patron (Alexander Vance)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && currentStep !== 5) {
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
        <div className="pb-8 border-b border-[#D8D5CF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/"
            className="font-editorial tracking-[0.25em] text-2xl font-bold uppercase text-[#111111]"
          >
            NOIR ATELIER
          </Link>
          <span className="text-[11px] uppercase tracking-widest text-[#6B6B6B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted Secure Checkout</span>
          </span>
        </div>

        {/* Step Indicator */}
        <div className="py-6 flex items-center justify-between border-b border-[#D8D5CF] overflow-x-auto no-scrollbar">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2 shrink-0">
              <span
                className={`w-6 h-6 rounded-full text-xs font-mono flex items-center justify-center ${
                  currentStep === s.num
                    ? "bg-[#111111] text-[#F5F3EF]"
                    : currentStep > s.num
                    ? "bg-emerald-600 text-white"
                    : "border border-[#D8D5CF] text-[#6B6B6B]"
                }`}
              >
                {currentStep > s.num ? <Check className="w-3 h-3" /> : s.num}
              </span>
              <span
                className={`text-xs uppercase tracking-wider ${
                  currentStep === s.num
                    ? "font-semibold text-[#111111]"
                    : "text-[#6B6B6B]"
                }`}
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#D8D5CF] mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Step 5: Confirmation Screen */}
        {currentStep === 5 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 max-w-2xl mx-auto text-center space-y-6"
          >
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
              Your garments are now entering the tailored dispatch queue. We have transmitted your bespoke packaging receipt and tracking documentation to <strong className="text-[#111111]">{email}</strong>.
            </p>

            {createdOrder && (
              <div className="my-8 p-6 bg-[#EAE8E2] border border-[#D8D5CF] text-left space-y-4">
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

                {/* Payment Gateway Settlement Receipt */}
                <div className="p-4 bg-white border border-[#D8D5CF] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B]">
                      Settled Payment Channel
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{createdOrder.paymentMethod?.includes("Cash on Delivery") ? "Verified for Delivery" : "Payment Authorized"}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#111111]">{createdOrder.paymentMethod}</span>
                    </div>
                    {createdOrder.transactionId && (
                      <span className="font-mono text-[11px] text-[#6B6B6B]">
                        Ref: {createdOrder.transactionId}
                      </span>
                    )}
                  </div>

                  {createdOrder.paymentMethod?.includes("bKash") || createdOrder.paymentMethod?.includes("Nagad") ? (
                    <div className="text-[11px] font-mono text-[#6B6B6B] pt-1 border-t border-[#D8D5CF]/50 flex justify-between">
                      <span>MFS BDT Equivalent:</span>
                      <span className="font-semibold text-[#111111]">
                        ৳{Math.round(createdOrder.total * 120).toLocaleString()} BDT (Rate: 1 USD = ৳120)
                      </span>
                    </div>
                  ) : createdOrder.paymentMethod?.includes("Cash on Delivery") ? (
                    <div className="text-[11px] text-[#6B6B6B] pt-1 border-t border-[#D8D5CF]/50 flex justify-between">
                      <span>Doorstep Collection:</span>
                      <span className="font-medium text-[#111111]">
                        {formatPrice(createdOrder.total)} / approx. ৳{Math.round(createdOrder.total * 120).toLocaleString()} BDT
                      </span>
                    </div>
                  ) : null}
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
                  <span>Total Amount</span>
                  <span>{formatPrice(createdOrder.total)}</span>
                </div>
              </div>
            )}

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
          </motion.div>
        ) : (
          /* Multi-step Form & Order Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-10 items-start">
            {/* Left Column: Multi-Step Forms */}
            <form onSubmit={handleNextStep} className="lg:col-span-7 space-y-8">
              {/* Step 1: Customer Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                    1. Contact Information
                  </h2>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                      Email Address (For Order Tracking)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexander@noir.studio"
                      className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                    2. Shipping Address
                  </h2>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="740 Park Avenue, Apt 14B"
                      className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                        State / Province
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                      Country / Region
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Japan">Japan</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Delivery Method */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                    3. Delivery Courier Service
                  </h2>

                  <div className="space-y-3">
                    <label
                      onClick={() => setDeliveryMethod("standard")}
                      className={`flex items-start justify-between p-5 border cursor-pointer transition-all ${
                        deliveryMethod === "standard"
                          ? "border-[#111111] bg-white ring-1 ring-[#111111]"
                          : "border-[#D8D5CF] bg-[#EAE8E2]/50 hover:border-[#111111]"
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#111111] block">
                          Atelier Standard Express (Carbon Neutral)
                        </span>
                        <p className="text-[11px] text-[#6B6B6B]">
                          Delivered in custom luxury matte sleeve within 2-4 business days.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#111111]">
                        {subtotal >= 250 ? "FREE" : "$25"}
                      </span>
                    </label>

                    <label
                      onClick={() => setDeliveryMethod("priority")}
                      className={`flex items-start justify-between p-5 border cursor-pointer transition-all ${
                        deliveryMethod === "priority"
                          ? "border-[#111111] bg-white ring-1 ring-[#111111]"
                          : "border-[#D8D5CF] bg-[#EAE8E2]/50 hover:border-[#111111]"
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#111111] block">
                          Atelier Priority Courier (Next Day by 12 PM)
                        </span>
                        <p className="text-[11px] text-[#6B6B6B]">
                          Dedicated courier dispatch with temperature and crease-prevention guarantee.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#111111]">
                        $45
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Payment Gateway Selector & Form */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                      4. Payment Gateway Authentication
                    </h2>
                    <p className="text-xs text-[#6B6B6B] mt-1 font-light">
                      Select your preferred payment channel. All transactions are securely routed through 256-bit encrypted gateways.
                    </p>
                  </div>

                  {/* Sandbox Mode Active Badge */}
                  <div className="p-3 bg-white border border-[#D8D5CF] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#111111]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                        Multi-Gateway Sandbox Active
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6B6B6B] font-mono">
                      Safe Test Mode • 1-Click Demo Fill Available
                    </span>
                  </div>

                  {/* Gateway Selector Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {/* 1. Credit / Debit Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway("card")}
                      className={`p-3 text-left border transition-all flex flex-col justify-between min-h-[92px] ${
                        paymentGateway === "card"
                          ? "border-[#111111] bg-white ring-1 ring-[#111111] shadow-xs"
                          : "border-[#D8D5CF] bg-[#EAE8E2]/50 hover:border-[#111111]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 rounded bg-[#111111] text-[#F5F3EF] flex items-center justify-center">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-[#6B6B6B]">
                          Cards
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block">
                          Card
                        </span>
                        <span className="text-[10px] text-[#6B6B6B] block">
                          Visa / MC / Amex
                        </span>
                      </div>
                    </button>

                    {/* 2. bKash */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway("bkash")}
                      className={`p-3 text-left border transition-all flex flex-col justify-between min-h-[92px] ${
                        paymentGateway === "bkash"
                          ? "border-[#E2136E] bg-white ring-1 ring-[#E2136E] shadow-xs"
                          : "border-[#D8D5CF] bg-[#EAE8E2]/50 hover:border-[#E2136E]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 rounded bg-[#E2136E] text-white flex items-center justify-center font-bold text-[10px]">
                          bK
                        </div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-[#E2136E] font-medium">
                          BD Favorite
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block">
                          bKash
                        </span>
                        <span className="text-[10px] text-[#6B6B6B] block">
                          বিকাশ MFS
                        </span>
                      </div>
                    </button>

                    {/* 3. Nagad */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway("nagad")}
                      className={`p-3 text-left border transition-all flex flex-col justify-between min-h-[92px] ${
                        paymentGateway === "nagad"
                          ? "border-[#F7941D] bg-white ring-1 ring-[#F7941D] shadow-xs"
                          : "border-[#D8D5CF] bg-[#EAE8E2]/50 hover:border-[#F7941D]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 rounded bg-[#F7941D] text-white flex items-center justify-center font-bold text-[10px]">
                          NG
                        </div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-[#F7941D] font-medium">
                          Postal Pay
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block">
                          Nagad
                        </span>
                        <span className="text-[10px] text-[#6B6B6B] block">
                          নগদ Wallet
                        </span>
                      </div>
                    </button>

                    {/* 4. Apple Pay / Google Pay */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway("applepay")}
                      className={`p-3 text-left border transition-all flex flex-col justify-between min-h-[92px] ${
                        paymentGateway === "applepay"
                          ? "border-[#111111] bg-white ring-1 ring-[#111111] shadow-xs"
                          : "border-[#D8D5CF] bg-[#EAE8E2]/50 hover:border-[#111111]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center font-semibold text-[11px]">
                          
                        </div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-[#6B6B6B]">
                          1-Click
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block">
                          Wallets
                        </span>
                        <span className="text-[10px] text-[#6B6B6B] block">
                          Apple / GPay
                        </span>
                      </div>
                    </button>

                    {/* 5. Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway("cod")}
                      className={`p-3 text-left border transition-all flex flex-col justify-between min-h-[92px] ${
                        paymentGateway === "cod"
                          ? "border-[#111111] bg-white ring-1 ring-[#111111] shadow-xs"
                          : "border-[#D8D5CF] bg-[#EAE8E2]/50 hover:border-[#111111]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 rounded bg-[#2D4A3E] text-white flex items-center justify-center">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-[#2D4A3E] font-medium">
                          Doorstep
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block">
                          Cash / COD
                        </span>
                        <span className="text-[10px] text-[#6B6B6B] block">
                          ক্যাশ অন ডেলিভারি
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* GATEWAY 1: CREDIT / DEBIT CARD */}
                  {paymentGateway === "card" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2"
                    >
                      {/* Card Demo Presets */}
                      <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-[#D8D5CF]">
                        <span className="text-[10px] uppercase font-mono text-[#6B6B6B]">
                          Demo Cards:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCardBrand("visa");
                            setCardNumber("4532 8820 9182 8892");
                            setCardExpiry("12/28");
                            setCardCvc("742");
                          }}
                          className="px-2.5 py-1 bg-[#F5F3EF] hover:bg-[#111111] hover:text-[#F5F3EF] text-[10px] font-mono border border-[#D8D5CF] transition-colors"
                        >
                          Visa (• 8892)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCardBrand("mastercard");
                            setCardNumber("5412 7532 9901 3410");
                            setCardExpiry("08/27");
                            setCardCvc("819");
                          }}
                          className="px-2.5 py-1 bg-[#F5F3EF] hover:bg-[#111111] hover:text-[#F5F3EF] text-[10px] font-mono border border-[#D8D5CF] transition-colors"
                        >
                          Mastercard (• 3410)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCardBrand("amex");
                            setCardNumber("3782 8224 5900 1004");
                            setCardExpiry("11/29");
                            setCardCvc("4421");
                          }}
                          className="px-2.5 py-1 bg-[#F5F3EF] hover:bg-[#111111] hover:text-[#F5F3EF] text-[10px] font-mono border border-[#D8D5CF] transition-colors"
                        >
                          AMEX (• 1004)
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                          />
                          <div className="absolute right-3.5 top-3 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#EAE8E2] border border-[#D8D5CF] text-[#111111]">
                              {cardBrand.toUpperCase()}
                            </span>
                            <CreditCard className="w-4 h-4 text-[#6B6B6B]" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                            Expires (MM/YY)
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                            Security Code (CVC)
                          </label>
                          <input
                            type="text"
                            required
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-[#6B6B6B]">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>PCI-DSS Level 1 & 3D Secure 2.0 Encrypted</span>
                        </span>
                        <span className="font-mono text-[10px]">AUTH-CARD-256</span>
                      </div>
                    </motion.div>
                  )}

                  {/* GATEWAY 2: BKASH */}
                  {paymentGateway === "bkash" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2"
                    >
                      {/* bKash Header Badge */}
                      <div className="bg-gradient-to-r from-[#E2136E] to-[#B80F58] p-4 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-white text-[#E2136E] font-bold text-[10px] rounded">
                              bKash
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider">
                              Direct Payment Gateway
                            </span>
                          </div>
                          <p className="text-[11px] text-white/90">
                            Merchant: NOIR ATELIER LIMITED (BANGLADESH)
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-[10px] font-mono uppercase tracking-wider block text-white/80">
                            Total in BDT (৳)
                          </span>
                          <span className="text-lg font-bold font-mono">
                            ৳{grandTotalBdt.toLocaleString()} BDT
                          </span>
                          <span className="text-[10px] block text-white/70">
                            ($1 = ৳120 BDT)
                          </span>
                        </div>
                      </div>

                      {/* bKash Demo Helper */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-[#D8D5CF]">
                        <button
                          type="button"
                          onClick={() => {
                            setBkashNumber("01712345678");
                            setBkashOtp("482910");
                            setBkashPin("•••••");
                            setBkashOtpNotice("Demo bKash credentials loaded successfully!");
                          }}
                          className="px-2.5 py-1 bg-[#E2136E]/10 hover:bg-[#E2136E] text-[#E2136E] hover:text-white text-[10px] font-mono border border-[#E2136E]/30 transition-colors"
                        >
                          // 1-Click Demo bKash (01712-345678)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                            setBkashOtp(newOtp);
                            setBkashOtpNotice(`Generated new bKash OTP code: ${newOtp}`);
                          }}
                          className="text-[10px] font-mono text-[#6B6B6B] hover:text-[#111111] flex items-center gap-1 underline"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Get New OTP</span>
                        </button>
                      </div>

                      {bkashOtpNotice && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span>{bkashOtpNotice}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                          Your bKash Account Number
                        </label>
                        <input
                          type="text"
                          required
                          value={bkashNumber}
                          onChange={(e) => setBkashNumber(e.target.value)}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#E2136E]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                            bKash OTP (6 Digits)
                          </label>
                          <input
                            type="text"
                            required
                            value={bkashOtp}
                            onChange={(e) => setBkashOtp(e.target.value)}
                            placeholder="6-digit verification code"
                            className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#E2136E]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                            bKash PIN (5 Digits)
                          </label>
                          <input
                            type="password"
                            required
                            value={bkashPin}
                            onChange={(e) => setBkashPin(e.target.value)}
                            placeholder="5-digit secret PIN"
                            className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#E2136E]"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-[#F5F3EF] border border-[#D8D5CF] text-[11px] text-[#6B6B6B] space-y-1">
                        <span className="font-semibold text-[#111111] block">bKash Authorization Terms:</span>
                        <p>
                          By confirming, you authorize bKash MFS to debit ৳{grandTotalBdt.toLocaleString()} BDT directly to NOIR ATELIER. Safe sandbox verification ensures test orders complete instantly.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* GATEWAY 3: NAGAD */}
                  {paymentGateway === "nagad" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2"
                    >
                      {/* Nagad Header Badge */}
                      <div className="bg-gradient-to-r from-[#F7941D] to-[#E65100] p-4 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-white text-[#F7941D] font-bold text-[10px] rounded">
                              Nagad
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider">
                              Postal Digital Financial Gateway
                            </span>
                          </div>
                          <p className="text-[11px] text-white/90">
                            Merchant: NOIR ATELIER POSTAL COMMERCE
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-[10px] font-mono uppercase tracking-wider block text-white/80">
                            Total Payable (BDT)
                          </span>
                          <span className="text-lg font-bold font-mono">
                            ৳{grandTotalBdt.toLocaleString()} BDT
                          </span>
                          <span className="text-[10px] block text-white/70">
                            ($1 = ৳120 BDT)
                          </span>
                        </div>
                      </div>

                      {/* Nagad Demo Helper */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-[#D8D5CF]">
                        <button
                          type="button"
                          onClick={() => {
                            setNagadNumber("01987654321");
                            setNagadOtp("783921");
                            setNagadPin("••••");
                            setNagadOtpNotice("Demo Nagad credentials loaded successfully!");
                          }}
                          className="px-2.5 py-1 bg-[#F7941D]/10 hover:bg-[#F7941D] text-[#D97706] hover:text-white text-[10px] font-mono border border-[#F7941D]/30 transition-colors"
                        >
                          // 1-Click Demo Nagad (01987-654321)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                            setNagadOtp(newOtp);
                            setNagadOtpNotice(`Generated new Nagad OTP code: ${newOtp}`);
                          }}
                          className="text-[10px] font-mono text-[#6B6B6B] hover:text-[#111111] flex items-center gap-1 underline"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Get New OTP</span>
                        </button>
                      </div>

                      {nagadOtpNotice && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span>{nagadOtpNotice}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                          Nagad Account / Mobile Number
                        </label>
                        <input
                          type="text"
                          required
                          value={nagadNumber}
                          onChange={(e) => setNagadNumber(e.target.value)}
                          placeholder="e.g. 019XXXXXXXX"
                          className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#F7941D]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                            Nagad OTP (6 Digits)
                          </label>
                          <input
                            type="text"
                            required
                            value={nagadOtp}
                            onChange={(e) => setNagadOtp(e.target.value)}
                            placeholder="6-digit OTP"
                            className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#F7941D]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                            Nagad PIN (4 Digits)
                          </label>
                          <input
                            type="password"
                            required
                            value={nagadPin}
                            onChange={(e) => setNagadPin(e.target.value)}
                            placeholder="4-digit PIN"
                            className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#F7941D]"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-[#F5F3EF] border border-[#D8D5CF] text-[11px] text-[#6B6B6B]">
                        <span>Approved by Bangladesh Postal Department. Instant electronic token payment clearance.</span>
                      </div>
                    </motion.div>
                  )}

                  {/* GATEWAY 4: APPLE PAY / GOOGLE PAY */}
                  {paymentGateway === "applepay" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2"
                    >
                      {/* Wallet Toggle */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setWalletType("apple")}
                          className={`p-3 border text-center transition-all ${
                            walletType === "apple"
                              ? "bg-black text-white border-black"
                              : "bg-white text-[#111111] border-[#D8D5CF]"
                          }`}
                        >
                          <span className="font-semibold text-xs tracking-wider"> Apple Pay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWalletType("google")}
                          className={`p-3 border text-center transition-all ${
                            walletType === "google"
                              ? "bg-black text-white border-black"
                              : "bg-white text-[#111111] border-[#D8D5CF]"
                          }`}
                        >
                          <span className="font-semibold text-xs tracking-wider">GPay Google Pay</span>
                        </button>
                      </div>

                      {/* Biometric Simulation Box */}
                      <div className="p-6 bg-white border border-[#D8D5CF] text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center mx-auto shadow-md">
                          {biometricStatus === "scanning" ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                          ) : (
                            <Smartphone className="w-6 h-6" />
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6B6B6B] block mb-1">
                            {walletType === "apple" ? "APPLE SECURE ENCLAVE" : "GOOGLE WALLET TOKEN"}
                          </span>
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
                            {biometricStatus === "verified"
                              ? "Biometric Identity Authenticated"
                              : biometricStatus === "scanning"
                              ? "Reading Touch ID / Face ID..."
                              : "Biometric Authentication Ready"}
                          </h4>
                          <p className="text-[11px] text-[#6B6B6B] mt-1 max-w-sm mx-auto">
                            One-touch authorization with zero card details exposed to merchants.
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-mono uppercase tracking-wider rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tokenized & Verified: {formatPrice(grandTotal)}</span>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBiometricStatus("scanning");
                              setTimeout(() => setBiometricStatus("verified"), 800);
                            }}
                            className="text-xs uppercase font-mono tracking-wider text-[#111111] underline hover:text-[#6B6B6B]"
                          >
                            // Simulate Face ID / Fingerprint Scan
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* GATEWAY 5: CASH ON DELIVERY (COD) */}
                  {paymentGateway === "cod" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2"
                    >
                      <div className="p-6 bg-white border border-[#D8D5CF] space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#2D4A3E] text-white flex items-center justify-center shrink-0">
                            <Truck className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#2D4A3E] font-semibold block mb-0.5">
                              DOORSTEP COLLECTION // ক্যাশ অন ডেলিভারি
                            </span>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
                              Pay When Your Garments Arrive
                            </h4>
                            <p className="text-xs text-[#6B6B6B] mt-1 font-light leading-relaxed">
                              Zero upfront electronic deduction. You may inspect the luxury packaging upon courier arrival and hand over payment or scan the rider&apos;s portable POS device.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D8D5CF]/60">
                          <div className="p-3 bg-[#F5F3EF] border border-[#D8D5CF] text-xs">
                            <span className="font-semibold text-[#111111] block mb-1">
                              Payment Options on Arrival:
                            </span>
                            <ul className="text-[11px] text-[#6B6B6B] space-y-0.5">
                              <li>• Cash in BDT or USD</li>
                              <li>• Scan rider&apos;s bKash / Nagad QR code</li>
                              <li>• Portable wireless credit card terminal</li>
                            </ul>
                          </div>

                          <div className="p-3 bg-[#F5F3EF] border border-[#D8D5CF] text-xs">
                            <span className="font-semibold text-[#111111] block mb-1">
                              Amount Due at Doorstep:
                            </span>
                            <span className="text-sm font-mono font-bold text-[#111111] block">
                              {formatPrice(grandTotal)}
                            </span>
                            <span className="text-[10px] text-[#6B6B6B] block">
                              (Approx. ৳{grandTotalBdt.toLocaleString()} BDT @ 1 USD = ৳120)
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                            Recipient Contact Phone (For Courier Dispatch Call)
                          </label>
                          <input
                            type="text"
                            required
                            value={codPhone}
                            onChange={(e) => setCodPhone(e.target.value)}
                            placeholder="+880 1712-345678"
                            className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                            Special Courier Delivery Note (Optional)
                          </label>
                          <input
                            type="text"
                            value={codInstructions}
                            onChange={(e) => setCodInstructions(e.target.value)}
                            placeholder="e.g. Call before coming, leave at reception"
                            className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 flex items-center justify-between border-t border-[#D8D5CF]">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev - 1) as CheckoutStep)}
                    className="text-xs uppercase tracking-widest text-[#6B6B6B] hover:text-[#111111] transition-colors"
                  >
                    Back to previous step
                  </button>
                )}
                {currentStep === 1 && <div />}

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>
                    {currentStep === 4 ? (
                      paymentGateway === "card"
                        ? `Authorise Card Payment ${formatPrice(grandTotal)}`
                        : paymentGateway === "bkash"
                        ? `Confirm bKash Payment ৳${grandTotalBdt.toLocaleString()} BDT`
                        : paymentGateway === "nagad"
                        ? `Confirm Nagad Payment ৳${grandTotalBdt.toLocaleString()} BDT`
                        : paymentGateway === "applepay"
                        ? `Complete with ${walletType === "apple" ? "Pay" : "GPay"} ${formatPrice(grandTotal)}`
                        : `Confirm Cash on Delivery (${formatPrice(grandTotal)})`
                    ) : (
                      "Continue Step"
                    )}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Right Column: Order Summary Review */}
            <div className="lg:col-span-5 bg-[#EAE8E2]/60 border border-[#D8D5CF] p-8 space-y-6">
              <h3 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                Bag Review ({cart.length})
              </h3>

              <div className="divide-y divide-[#D8D5CF] max-h-[300px] overflow-y-auto no-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 flex gap-4 items-center">
                    <div className="relative w-14 h-18 bg-[#EAE8E2] shrink-0 overflow-hidden border border-[#D8D5CF]">
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
                    <span className="text-xs font-medium text-[#111111]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-[#D8D5CF] pt-4 text-xs text-[#6B6B6B]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#111111] font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Complimentary" : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Duties</span>
                  <span>Included</span>
                </div>
                <div className="pt-2 border-t border-[#D8D5CF] flex justify-between text-base font-semibold text-[#111111]">
                  <span>Total Due</span>
                  <span className="text-xl font-light">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
