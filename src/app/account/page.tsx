"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Heart,
  MapPin,
  User,
  LogOut,
  ArrowRight,
  ShieldAlert,
  Check,
  Plus,
} from "lucide-react";
import { useAuth, Address } from "@/lib/context/AuthContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { formatPrice } from "@/lib/utils";

type TabType = "orders" | "addresses" | "wishlist" | "profile";

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, updateAddress } = useAuth();
  const { wishlistItems } = useWishlist();
  const [activeTab, setActiveTab] = useState<TabType>("orders");

  // New address state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPostal, setNewPostal] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] pt-36 pb-24 px-6 text-center">
        <h1 className="font-editorial text-3xl uppercase text-[#111111]">
          Sign In Required
        </h1>
        <p className="text-xs text-[#6B6B6B] mt-2 mb-6">
          Please log in to inspect your orders and saved atelier addresses.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStreet && newCity) {
      updateAddress({
        id: `addr_${Date.now()}`,
        name: user.name,
        street: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPostal,
        country: "United States",
      });
      setShowAddressModal(false);
      setNewStreet("");
      setNewCity("");
      setNewState("");
      setNewPostal("");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-28 pb-32 px-6 sm:px-12 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header with Role Switcher banner */}
        <div className="pb-8 border-b border-[#D8D5CF] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block mb-2">
              CLIENT MEMBERSHIP // NOIR PRIVATE ATELIER
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal uppercase tracking-tight text-[#111111]">
              Hello, {user.name}
            </h1>
            <span className="text-xs text-[#6B6B6B] font-mono mt-1 block">
              {user.email} • Status: Private Patron
            </span>
          </div>

          {/* Client Patron Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EAE8E2] border border-[#D8D5CF] text-[10px] uppercase font-mono tracking-widest text-[#111111]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Black Card Patron // Tier 01</span>
          </div>
        </div>

        {/* Account Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 items-start">
          {/* Sidebar Nav */}
          <div className="lg:col-span-3 space-y-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between p-3.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                activeTab === "orders"
                  ? "bg-[#111111] text-[#F5F3EF]"
                  : "text-[#111111] hover:bg-[#EAE8E2]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Orders History</span>
              </span>
              <span className="font-mono text-[11px]">({user.orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center justify-between p-3.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                activeTab === "addresses"
                  ? "bg-[#111111] text-[#F5F3EF]"
                  : "text-[#111111] hover:bg-[#EAE8E2]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>Shipping Addresses</span>
              </span>
              <span className="font-mono text-[11px]">({user.addresses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`w-full flex items-center justify-between p-3.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                activeTab === "wishlist"
                  ? "bg-[#111111] text-[#F5F3EF]"
                  : "text-[#111111] hover:bg-[#EAE8E2]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Heart className="w-4 h-4" />
                <span>Saved Wishlist</span>
              </span>
              <span className="font-mono text-[11px]">({wishlistItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between p-3.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-[#111111] text-[#F5F3EF]"
                  : "text-[#111111] hover:bg-[#EAE8E2]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Profile & Measurements</span>
              </span>
            </button>

            <div className="pt-4 border-t border-[#D8D5CF]">
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="w-full flex items-center gap-2.5 p-3.5 text-xs uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Tab Panel */}
          <div className="lg:col-span-9 bg-[#EAE8E2]/50 border border-[#D8D5CF] p-8 sm:p-10">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#D8D5CF] pb-4">
                  <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                    Atelier Orders
                  </h2>
                  <span className="text-xs font-mono text-[#6B6B6B]">
                    {user.orders.length} Records
                  </span>
                </div>

                {user.orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-xs text-[#6B6B6B]">You have placed no orders yet.</p>
                    <Link
                      href="/shop"
                      className="mt-4 inline-block px-6 py-2.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium"
                    >
                      Browse Atelier
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {user.orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border border-[#D8D5CF] p-6 space-y-4 shadow-sm"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D8D5CF]">
                          <div>
                            <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                              Order {order.id}
                            </span>
                            <span className="text-xs text-[#6B6B6B] block">
                              Placed on {order.date}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-black/5 text-[#111111] text-[10px] uppercase font-mono tracking-wider font-medium">
                              Tracking: {order.trackingNumber}
                            </span>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-medium tracking-wider">
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-[#D8D5CF]/60">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-3 first:pt-0 flex gap-4 items-center">
                              <div className="relative w-12 h-16 bg-[#EAE8E2] shrink-0 overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <span className="text-xs uppercase font-medium text-[#111111]">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-[#6B6B6B] block">
                                  Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-[#111111]">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Total & Payment Info */}
                        <div className="pt-3 border-t border-[#D8D5CF] flex flex-wrap justify-between items-center gap-2 text-xs font-medium text-[#111111]">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="uppercase tracking-wider font-mono text-[10px] px-2 py-0.5 bg-[#EAE8E2] border border-[#D8D5CF] text-[#111111]">
                              {order.paymentMethod || "Card (Visa •••• 8892)"}
                            </span>
                            {order.transactionId && (
                              <span className="font-mono text-[10px] text-[#6B6B6B]">
                                Trx: {order.transactionId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#6B6B6B]">Total Settled:</span>
                            <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#D8D5CF] pb-4">
                  <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                    Saved Shipping Addresses
                  </h2>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-3.5 py-1.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white border border-[#D8D5CF] p-5 space-y-2 relative"
                    >
                      {addr.isDefault && (
                        <span className="text-[10px] uppercase tracking-widest font-mono text-[#6B6B6B] bg-[#EAE8E2] px-2 py-0.5 inline-block mb-1">
                          Default Address
                        </span>
                      )}
                      <p className="text-xs font-medium uppercase text-[#111111]">{addr.name}</p>
                      <p className="text-xs text-[#6B6B6B]">{addr.street}</p>
                      <p className="text-xs text-[#6B6B6B]">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">{addr.country}</p>
                    </div>
                  ))}
                </div>

                {/* Add Address Form Modal / Inline */}
                {showAddressModal && (
                  <form onSubmit={handleAddAddress} className="mt-6 bg-white border border-[#D8D5CF] p-6 space-y-4">
                    <h3 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                      New Destination Address
                    </h3>
                    <input
                      type="text"
                      required
                      placeholder="Street Address"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full bg-[#F5F3EF] border border-[#D8D5CF] px-3.5 py-2 text-xs text-[#111111]"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="bg-[#F5F3EF] border border-[#D8D5CF] px-3.5 py-2 text-xs text-[#111111]"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="bg-[#F5F3EF] border border-[#D8D5CF] px-3.5 py-2 text-xs text-[#111111]"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Postal Code"
                        value={newPostal}
                        onChange={(e) => setNewPostal(e.target.value)}
                        className="bg-[#F5F3EF] border border-[#D8D5CF] px-3.5 py-2 text-xs text-[#111111]"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-wider font-medium"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="px-4 py-2 border border-[#D8D5CF] text-xs uppercase tracking-wider text-[#6B6B6B]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#D8D5CF] pb-4">
                  <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                    Saved Silhouettes ({wishlistItems.length})
                  </h2>
                  <Link
                    href="/wishlist"
                    className="text-xs uppercase tracking-widest text-[#111111] underline"
                  >
                    Open Full Wishlist
                  </Link>
                </div>

                {wishlistItems.length === 0 ? (
                  <p className="text-xs text-[#6B6B6B] py-8 text-center">
                    No items in wishlist yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        className="flex gap-4 p-3 bg-white border border-[#D8D5CF] hover:border-[#111111] transition-colors"
                      >
                        <div className="relative w-16 h-20 bg-[#EAE8E2] shrink-0">
                          <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <span className="text-xs uppercase font-medium text-[#111111] block">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-[#6B6B6B]">{item.category}</span>
                          </div>
                          <span className="text-xs font-semibold text-[#111111]">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111] border-b border-[#D8D5CF] pb-4">
                  Profile & Atelier Sizing Notes
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white border border-[#D8D5CF] p-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block">
                      Client Name
                    </span>
                    <p className="text-sm font-medium text-[#111111] mt-1">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block">
                      Email
                    </span>
                    <p className="text-sm font-medium text-[#111111] mt-1">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block">
                      Atelier Preference
                    </span>
                    <p className="text-xs text-[#111111] mt-1">Outerwear Size: Large / 40R</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block">
                      Security & Privacy
                    </span>
                    <p className="text-xs text-[#111111] mt-1">Two-Factor Authentication Active</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
