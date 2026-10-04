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
  Lock,
  RotateCcw,
  CheckCircle2,
  Wallet,
  Building2,
  Phone,
  AlertCircle,
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
  const [phone, setPhone] = useState("+880 1712-345678");
  const [firstName, setFirstName] = useState(user?.name.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name.split(" ")[1] || "");
  const [address, setAddress] = useState(user?.addresses[0]?.street || "");
  const [city, setCity] = useState(user?.addresses[0]?.city || "");
  const [state, setState] = useState(user?.addresses[0]?.state || "");
  const [postalCode, setPostalCode] = useState(user?.addresses[0]?.postalCode || "");
  const [country, setCountry] = useState("Bangladesh");

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "priority">("standard");

  // Payment Selection: Online Payment (SSLCOMMERZ) vs Cash on Delivery
  type PaymentMethodType = "online" | "cod";
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("online");

  // Cash on Delivery specific state
  const [codInstructions, setCodInstructions] = useState("Call 30 mins before arrival at doorstep");

  // Processing & Error states
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

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
    }
  }, [user]);

  const shippingCost = deliveryMethod === "priority" ? 45 : subtotal >= 250 ? 0 : 25;
  const grandTotal = subtotal + shippingCost;
  const BDT_RATE = 120;
  const grandTotalBdt = Math.round(grandTotal * BDT_RATE);

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as CheckoutStep);
      return;
    }

    if (currentStep === 4) {
      // 1. Basic validation
      if (!email || !firstName || !lastName || !address || !city) {
        setCheckoutError("Please complete all required shipping & contact details.");
        return;
      }

      setIsProcessing(true);

      if (paymentMethod === "online") {
        // Online Payment via SSLCOMMERZ Official Flow
        try {
          const payload = {
            customerName: `${firstName} ${lastName}`.trim(),
            customerEmail: email,
            customerPhone: phone || "+8801700000000",
            shippingAddress: {
              street: address,
              city: city || "Dhaka",
              state: state || "Dhaka",
              postalCode: postalCode || "1212",
              country: country || "Bangladesh",
            },
            deliveryMethod,
            userId: user?.id,
            items: cart.map((item) => ({
              productId: item.productId || item.product.id || item.product.slug,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
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
            customerEmail: email,
            customerPhone: phone || "+8801700000000",
            shippingAddress: {
              street: address,
              city: city || "Dhaka",
              state: state || "Dhaka",
              postalCode: postalCode || "1212",
              country: country || "Bangladesh",
            },
            deliveryMethod,
            paymentMethod: "COD",
            userId: user?.id,
            items: cart.map((item) => ({
              productId: item.productId || item.product.id || item.product.slug,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
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
            transactionId: data.data?.trackingNumber || `COD-${data.data?.orderId}`,
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
        } catch (err: any) {
          setCheckoutError(err.message || "Failed to place COD order.");
        } finally {
          setIsProcessing(false);
        }
      }
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
            <span>SSLCOMMERZ 256-Bit Encrypted Secure Checkout</span>
          </span>
        </div>

        {/* Step Indicator */}
        <div className="py-6 flex items-center justify-between border-b border-[#D8D5CF] overflow-x-auto no-scrollbar">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2 whitespace-nowrap">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep === s.num
                    ? "bg-[#111111] text-[#F5F3EF]"
                    : currentStep > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-[#D8D5CF] text-[#6B6B6B]"
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

        {/* Step 5: Confirmation Screen (For COD Orders) */}
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
              Your order has been recorded into our atelier production queue. We have transmitted full tracking details to <strong className="text-[#111111]">{email}</strong>.
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
                      {formatPrice(createdOrder.total)} / ৳{Math.round(createdOrder.total * 120).toLocaleString()} BDT
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
                  <span>Total Due</span>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                        Contact Phone (For SMS & Courier)
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 1712-345678"
                        className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
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
                      placeholder="Road 11, House 42, Banani"
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
                        placeholder="Dhaka"
                        className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                        State / Division
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Dhaka Division"
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
                        placeholder="1213"
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
                      className="w-full bg-white border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer"
                    >
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Delivery Options */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                    3. Delivery Tier
                  </h2>

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
                      <span className="text-xs font-mono font-medium text-[#111111]">
                        {subtotal >= 250 ? "Complimentary" : formatPrice(25)}
                      </span>
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
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block flex items-center gap-1.5">
                            <span>Priority Atelier Express</span>
                            <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-mono tracking-widest uppercase">
                              Rush
                            </span>
                          </span>
                          <span className="text-[11px] text-[#6B6B6B] block mt-0.5">
                            Next Business Day • Dedicated hand-delivered garment garment bag
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-medium text-[#111111]">
                        {formatPrice(45)}
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Real SSLCOMMERZ Payment & COD Selection */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                      4. Payment Method
                    </h2>
                    <p className="text-xs text-[#6B6B6B] mt-1 font-light">
                      Choose your preferred payment method. Online payments are processed through SSLCOMMERZ with official 256-bit bank encryption.
                    </p>
                  </div>

                  {/* Payment Method Selector Cards */}
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
                        Cards (Visa, MasterCard, Amex), bKash, Nagad, Rocket, Upay, and 30+ Net Banking channels.
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
                        Inspect garments at delivery and settle payment directly in cash with the courier rider.
                      </p>

                      <div className="pt-2 border-t border-[#D8D5CF]/60 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#6B6B6B]">Pay at Doorstep:</span>
                        <span className="font-semibold text-[#111111]">
                          {formatPrice(grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Panes based on selection */}
                  {paymentMethod === "online" ? (
                    <div className="p-5 bg-white border border-[#D8D5CF] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B]">
                          Accepted Payment Channels
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          Instant Authorization
                        </span>
                      </div>

                      {/* Brand Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-2.5 bg-[#F5F3EF] border border-[#D8D5CF] text-center">
                          <span className="text-xs font-semibold text-[#111111] block">Cards</span>
                          <span className="text-[9px] text-[#6B6B6B] block">Visa / Master / Amex</span>
                        </div>
                        <div className="p-2.5 bg-[#F5F3EF] border border-[#D8D5CF] text-center">
                          <span className="text-xs font-semibold text-[#E2136E] block">bKash</span>
                          <span className="text-[9px] text-[#6B6B6B] block">Instant Checkout</span>
                        </div>
                        <div className="p-2.5 bg-[#F5F3EF] border border-[#D8D5CF] text-center">
                          <span className="text-xs font-semibold text-[#F7941D] block">Nagad</span>
                          <span className="text-[9px] text-[#6B6B6B] block">Digital Wallet</span>
                        </div>
                        <div className="p-2.5 bg-[#F5F3EF] border border-[#D8D5CF] text-center">
                          <span className="text-xs font-semibold text-[#111111] block">Net Banking</span>
                          <span className="text-[9px] text-[#6B6B6B] block">30+ Local Banks</span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#F5F3EF] border border-[#D8D5CF] flex items-start gap-2.5 text-xs text-[#6B6B6B]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                          Clicking <strong className="text-[#111111]">"Proceed to Secure Payment"</strong> will safely redirect you to SSLCOMMERZ where you can choose your card, bKash, or bank to finish payment. Your sensitive details are never handled by or stored on our servers.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-white border border-[#D8D5CF] space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block">
                          Courier Delivery Instructions (Optional)
                        </label>
                        <input
                          type="text"
                          value={codInstructions}
                          onChange={(e) => setCodInstructions(e.target.value)}
                          placeholder="e.g. Call 30 mins before arrival, deliver after 3 PM"
                          className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-4 py-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                        />
                      </div>
                      <p className="text-[11px] text-[#6B6B6B]">
                        Please ensure the exact cash amount of <strong className="text-[#111111] font-mono">{formatPrice(grandTotal)} (৳{grandTotalBdt.toLocaleString()} BDT)</strong> is ready at your doorstep.
                      </p>
                    </div>
                  )}

                  {checkoutError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <p>{checkoutError}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 flex items-center justify-between border-t border-[#D8D5CF]">
                {currentStep > 1 && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setCurrentStep((prev) => (prev - 1) as CheckoutStep)}
                    className="text-xs uppercase tracking-widest text-[#6B6B6B] hover:text-[#111111] transition-colors disabled:opacity-50"
                  >
                    Back to previous step
                  </button>
                )}
                {currentStep === 1 && <div />}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-8 py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>
                        {paymentMethod === "online"
                          ? "Connecting to SSLCOMMERZ..."
                          : "Placing Atelier Order..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {currentStep === 4
                          ? paymentMethod === "online"
                            ? `Proceed to Secure Payment (৳${grandTotalBdt.toLocaleString()} BDT)`
                            : `Confirm Atelier Order (${formatPrice(grandTotal)})`
                          : "Continue Step"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
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
                  <span>BDT Conversion Rate</span>
                  <span className="font-mono text-[#111111]">1 USD = ৳120 BDT</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Duties</span>
                  <span>Included</span>
                </div>
                <div className="pt-2 border-t border-[#D8D5CF] flex justify-between text-base font-semibold text-[#111111]">
                  <span>Total Due</span>
                  <div className="text-right">
                    <span className="text-xl font-light block">{formatPrice(grandTotal)}</span>
                    <span className="text-[10px] text-[#6B6B6B] font-mono block">
                      approx. ৳{grandTotalBdt.toLocaleString()} BDT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
