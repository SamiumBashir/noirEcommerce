"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  Layers,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Check,
  Search,
  X,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { PRODUCTS, Product, CATEGORIES } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";

type AdminTab = "analytics" | "products" | "orders" | "customers" | "categories";

export default function AdminPage() {
  const { user, isAdmin, adminLogin, adminLogout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");

  // Admin Auth Gate State
  const [adminEmail, setAdminEmail] = useState("admin@noir.studio");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Local state for products so admin can add/edit/delete in live session
  const [productList, setProductList] = useState<Product[]>(PRODUCTS);
  const [productSearch, setProductSearch] = useState("");

  // Orders state
  const [ordersList, setOrdersList] = useState([
    {
      id: "ORD-9482-NR",
      customer: "Alexander Vance",
      email: "alexander@noir.studio",
      date: "2026-09-28",
      total: 374,
      status: "In Atelier",
      paymentStatus: "Settled (Visa •••• 8892)",
      items: "NOIR Motion Jacket, Shadow Oversized Tee",
    },
    {
      id: "ORD-8821-NR",
      customer: "Camille Dupont",
      email: "camille@dupont.fr",
      date: "2026-09-27",
      total: 440,
      status: "Dispatched",
      paymentStatus: "Settled (Amex •••• 1004)",
      items: "Sculptural Wool Coat",
    },
    {
      id: "ORD-7619-NR",
      customer: "Kenji Sato",
      email: "kenji@sato.jp",
      date: "2026-09-26",
      total: 295,
      status: "Delivered",
      paymentStatus: "Settled (Mastercard •••• 4410)",
      items: "Monolith Leather Tote",
    },
    {
      id: "ORD-6102-NR",
      customer: "Soren Lindqvist",
      email: "soren@lindqvist.se",
      date: "2026-09-25",
      total: 165,
      status: "Delivered",
      paymentStatus: "Settled (Apple Pay)",
      items: "Motion Cargo",
    },
    {
      id: "ORD-5541-BD",
      customer: "Tanjim Ahmed",
      email: "tanjim@dhaka.atelier",
      date: "2026-09-24",
      total: 210,
      status: "In Atelier",
      paymentStatus: "Settled (bKash 017••••678)",
      items: "Artisan Leather Loafer",
    },
    {
      id: "ORD-4190-NR",
      customer: "Elena Rostova",
      email: "elena@rostova.com",
      date: "2026-09-23",
      total: 185,
      status: "Processing",
      paymentStatus: "Pending (Cash on Delivery)",
      items: "Shadow Oversized Tee",
    },
  ]);

  // Customers state
  const [customersList, setCustomersList] = useState([
    {
      id: "CUST-01",
      name: "Alexander Vance",
      email: "alexander@noir.studio",
      totalOrders: 3,
      totalSpend: 1140,
      tier: "Black Card Patron",
    },
    {
      id: "CUST-02",
      name: "Camille Dupont",
      email: "camille@dupont.fr",
      totalOrders: 2,
      totalSpend: 820,
      tier: "Patron",
    },
    {
      id: "CUST-03",
      name: "Kenji Sato",
      email: "kenji@sato.jp",
      totalOrders: 4,
      totalSpend: 1480,
      tier: "Black Card Patron",
    },
    {
      id: "CUST-04",
      name: "Soren Lindqvist",
      email: "soren@lindqvist.se",
      totalOrders: 1,
      totalSpend: 165,
      tier: "Client",
    },
  ]);

  // Create Product Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"MEN" | "WOMEN" | "ACCESSORIES" | "NEW ARRIVALS">("MEN");
  const [newPrice, setNewPrice] = useState(195);
  const [newStock, setNewStock] = useState(15);
  const [newImageUrl, setNewImageUrl] = useState("https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop");
  const [newDesc, setNewDesc] = useState("Architectural tailoring designed for fluid movement.");

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Handle Product Deletion
  const handleDeleteProduct = (id: string) => {
    setProductList((prev) => prev.filter((p) => p.id !== id));
  };

  // Handle Product Creation
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const created: Product = {
      id: `noir-${Date.now()}`,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: newTitle,
      subtitle: "New Atelier Piece",
      category: newCategory,
      gender: newCategory === "WOMEN" ? "Women" : newCategory === "MEN" ? "Men" : "Unisex",
      price: Number(newPrice),
      rating: 5.0,
      reviewCount: 1,
      isNew: true,
      inStock: true,
      stockCount: Number(newStock),
      colors: [{ name: "Noir Black", hex: "#111111", image: newImageUrl }],
      sizes: ["S", "M", "L", "XL"],
      description: newDesc,
      details: ["Engineered technical fabrication", "Hand-finished atelier construction"],
      shippingInfo: "Complimentary global shipping.",
      careInstructions: "Specialist dry clean only.",
      images: [newImageUrl],
    };

    setProductList([created, ...productList]);
    setIsCreateModalOpen(false);
    setNewTitle("");
  };

  // Handle Edit Product
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProductList((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
    );
    setEditingProduct(null);
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Handle Admin Login submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Authentication failed. Invalid curator credentials.");
        setIsVerifying(false);
        return;
      }

      await adminLogin(adminEmail, adminPassword);
      setIsVerifying(false);
    } catch {
      const result = await adminLogin(adminEmail, adminPassword);
      if (!result.success) {
        setAuthError(result.error || "Access Denied: Invalid credentials.");
      }
      setIsVerifying(false);
    }
  };

  const handleAutoFillDemo = () => {
    setAdminEmail("admin@noir.studio");
    setAdminPassword("admin123");
    setAuthError("");
  };

  // Auth gate check - requires verified admin credentials
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen bg-[#F5F3EF] pt-32 pb-32 px-6 sm:px-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#EAE8E2]/80 border border-[#D8D5CF] p-8 sm:p-12 shadow-sm space-y-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 border border-[#D8D5CF] text-[10px] uppercase font-mono tracking-widest text-[#111111] mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Restricted Atelier System</span>
            </div>
            <div className="w-12 h-12 mx-auto rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl uppercase tracking-tight text-[#111111]">
              Curator Access
            </h1>
            <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">
              Administrative clearance required. Please verify your atelier curator email and security passkey.
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3.5 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
              <div className="leading-snug">
                <span className="font-semibold block uppercase tracking-wider text-[10px] mb-0.5">Authorization Denied</span>
                {authError}
              </div>
            </div>
          )}

          {/* Fast Auto-fill Demo Box */}
          <div className="bg-white/80 border border-[#D8D5CF] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6B6B]">
                // DEMO CREDENTIALS
              </span>
              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="text-[10px] uppercase tracking-wider text-[#111111] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Auto-fill</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[11px] font-mono text-[#111111] bg-[#F5F3EF] px-2.5 py-1.5 border border-[#D8D5CF]/60 flex items-center justify-between">
              <span>mail: admin@noir.studio</span>
              <span className="text-[#6B6B6B]">pass: admin123</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block font-mono">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@noir.studio"
                  className="w-full bg-white border border-[#D8D5CF] pl-9.5 pr-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block font-mono">
                Security Passkey
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#D8D5CF] pl-9.5 pr-10 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#111111]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-[#111111] text-[#F5F3EF] hover:bg-black text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isVerifying ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Unlock Atelier</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#D8D5CF]/60">
            <Link
              href="/"
              className="text-xs text-[#6B6B6B] hover:text-[#111111] transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <span>← Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredAdminProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const totalRevenue = ordersList.reduce((acc, o) => acc + o.total, 0) + 24850;

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-28 pb-32 px-6 sm:px-12 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="pb-8 border-b border-[#D8D5CF] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.3em] font-mono font-medium text-[#6B6B6B]">
                NOIR ATELIER SYSTEM // AUTHENTICATED
              </span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal uppercase tracking-tight text-[#111111]">
              Atelier Management
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1 font-mono">
              CURATOR SESSION: <span className="text-[#111111] font-semibold">{user?.email || "admin@noir.studio"}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 border border-[#111111] text-xs uppercase tracking-wider text-[#111111] hover:bg-[#111111] hover:text-[#F5F3EF] transition-colors"
            >
              View Storefront
            </Link>
            <button
              onClick={() => adminLogout()}
              className="px-4 py-2 bg-[#111111] text-[#F5F3EF] hover:bg-black text-xs uppercase tracking-wider transition-colors font-medium flex items-center gap-2 shadow-sm"
              title="Lock Atelier Console"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
          <div className="bg-white border border-[#D8D5CF] p-6 space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider text-[#6B6B6B]">
              <span>Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-editorial text-3xl text-[#111111]">
              {formatPrice(totalRevenue)}
            </p>
            <span className="text-[11px] text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% vs previous cycle</span>
            </span>
          </div>

          <div className="bg-white border border-[#D8D5CF] p-6 space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider text-[#6B6B6B]">
              <span>Active Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#111111]" />
            </div>
            <p className="font-editorial text-3xl text-[#111111]">
              {ordersList.length + 14}
            </p>
            <span className="text-[11px] text-[#6B6B6B]">
              4 in tailoring queue today
            </span>
          </div>

          <div className="bg-white border border-[#D8D5CF] p-6 space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider text-[#6B6B6B]">
              <span>Catalog Pieces</span>
              <Package className="w-4 h-4 text-[#111111]" />
            </div>
            <p className="font-editorial text-3xl text-[#111111]">
              {productList.length}
            </p>
            <span className="text-[11px] text-emerald-600">
              100% In stock & active
            </span>
          </div>

          <div className="bg-white border border-[#D8D5CF] p-6 space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider text-[#6B6B6B]">
              <span>Patrons & Clients</span>
              <Users className="w-4 h-4 text-[#111111]" />
            </div>
            <p className="font-editorial text-3xl text-[#111111]">
              {customersList.length + 128}
            </p>
            <span className="text-[11px] text-[#6B6B6B]">
              64% Returning clientele
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-12 flex gap-4 border-b border-[#D8D5CF] overflow-x-auto no-scrollbar">
          {(["analytics", "products", "orders", "customers", "categories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-2 text-xs uppercase tracking-widest font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab
                  ? "text-[#111111] font-semibold"
                  : "text-[#6B6B6B] hover:text-[#111111]"
              }`}
            >
              {tab === "analytics" && "Atelier Analytics"}
              {tab === "products" && `Products (${productList.length})`}
              {tab === "orders" && `Orders (${ordersList.length})`}
              {tab === "customers" && `Customers (${customersList.length})`}
              {tab === "categories" && "Categories"}

              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="pt-8">
          {/* 1. Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Velocity Chart Simulation */}
                <div className="bg-white border border-[#D8D5CF] p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                      Weekly Revenue Performance
                    </h3>
                    <span className="text-[11px] font-mono text-[#6B6B6B]">USD $</span>
                  </div>
                  {/* Visual Bar chart representation */}
                  <div className="h-48 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-[#D8D5CF]">
                    {[
                      { day: "Mon", val: 4200, pct: "45%" },
                      { day: "Tue", val: 5600, pct: "60%" },
                      { day: "Wed", val: 7800, pct: "80%" },
                      { day: "Thu", val: 6400, pct: "68%" },
                      { day: "Fri", val: 9200, pct: "95%" },
                      { day: "Sat", val: 11000, pct: "100%" },
                      { day: "Sun", val: 8400, pct: "85%" },
                    ].map((b) => (
                      <div key={b.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div
                          className="w-full bg-[#111111] hover:bg-black transition-all"
                          style={{ height: b.pct }}
                          title={`$${b.val}`}
                        />
                        <span className="text-[10px] uppercase font-mono text-[#6B6B6B]">{b.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-[#6B6B6B]">
                    <span>Weekly Peak: Saturday ($11,000)</span>
                    <span>Average Daily Velocity: $7,514</span>
                  </div>
                </div>

                {/* Best Selling Pieces */}
                <div className="bg-white border border-[#D8D5CF] p-6 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                    Top Revenue Silhouettes
                  </h3>
                  <div className="space-y-4 pt-2">
                    {productList.slice(0, 4).map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between pb-3 border-b border-[#D8D5CF]/60 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[#6B6B6B]">0{idx + 1}</span>
                          <div className="relative w-10 h-12 bg-[#EAE8E2] shrink-0">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="text-xs font-medium uppercase text-[#111111] block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-[#6B6B6B]">{p.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-[#111111] block">
                            {formatPrice(p.price)}
                          </span>
                          <span className="text-[10px] text-[#6B6B6B]">Stock: {p.stockCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search catalog products..."
                    className="w-full bg-white border border-[#D8D5CF] pl-9 pr-4 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Silhouette</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto bg-white border border-[#D8D5CF]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#D8D5CF] bg-[#EAE8E2]/60 uppercase tracking-widest text-[#6B6B6B] text-[10px]">
                      <th className="p-4">Piece</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D5CF]">
                    {filteredAdminProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-black/[0.02]">
                        <td className="p-4 flex items-center gap-3">
                          <div className="relative w-10 h-13 bg-[#EAE8E2] shrink-0">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-medium uppercase text-[#111111] block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-[#6B6B6B]">{p.slug}</span>
                          </div>
                        </td>
                        <td className="p-4 uppercase text-[#6B6B6B]">{p.category}</td>
                        <td className="p-4 font-medium text-[#111111]">{formatPrice(p.price)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 font-mono text-[10px] ${
                              p.stockCount > 10
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {p.stockCount} units
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[#111111]">★ {p.rating} ({p.reviewCount})</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 text-[#111111] hover:bg-black/5 rounded"
                            title="Edit Piece"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Piece"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="overflow-x-auto bg-white border border-[#D8D5CF]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#D8D5CF] bg-[#EAE8E2]/60 uppercase tracking-widest text-[#6B6B6B] text-[10px]">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment Channel</th>
                      <th className="p-4">Status & Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D5CF]">
                    {ordersList.map((order) => (
                      <tr key={order.id} className="hover:bg-black/[0.02]">
                        <td className="p-4 font-mono font-medium text-[#111111]">
                          {order.id}
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-[#111111] block">
                            {order.customer}
                          </span>
                          <span className="text-[10px] text-[#6B6B6B]">{order.email}</span>
                        </td>
                        <td className="p-4 text-[#6B6B6B]">{order.date}</td>
                        <td className="p-4 max-w-xs truncate text-[#6B6B6B]">{order.items}</td>
                        <td className="p-4 font-semibold text-[#111111]">
                          {formatPrice(order.total)}
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-1 bg-[#EAE8E2] border border-[#D8D5CF] text-[10px] font-mono font-medium text-[#111111]">
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-[#F5F3EF] border border-[#D8D5CF] px-2.5 py-1 text-xs text-[#111111] font-medium cursor-pointer focus:outline-none"
                          >
                            <option value="Processing">Processing</option>
                            <option value="In Atelier">In Atelier</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="overflow-x-auto bg-white border border-[#D8D5CF]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#D8D5CF] bg-[#EAE8E2]/60 uppercase tracking-widest text-[#6B6B6B] text-[10px]">
                      <th className="p-4">Client ID</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Tier Status</th>
                      <th className="p-4">Orders Placed</th>
                      <th className="p-4 text-right">Lifetime Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D5CF]">
                    {customersList.map((c) => (
                      <tr key={c.id} className="hover:bg-black/[0.02]">
                        <td className="p-4 font-mono text-[#6B6B6B]">{c.id}</td>
                        <td className="p-4 font-medium text-[#111111]">{c.name}</td>
                        <td className="p-4 text-[#6B6B6B]">{c.email}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-black/5 text-[#111111] text-[10px] uppercase font-mono">
                            {c.tier}
                          </span>
                        </td>
                        <td className="p-4 font-mono">{c.totalOrders}</td>
                        <td className="p-4 text-right font-medium text-[#111111]">
                          {formatPrice(c.totalSpend)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. Categories Tab */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="bg-white border border-[#D8D5CF] p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block">
                        DEPARTMENT
                      </span>
                      <h3 className="font-editorial text-2xl uppercase text-[#111111]">
                        {cat.name}
                      </h3>
                    </div>
                    <span className="text-xs font-mono bg-black/5 px-2.5 py-1">
                      {cat.itemCount}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">{cat.description}</p>
                  <div className="relative aspect-[16/7] overflow-hidden bg-[#EAE8E2]">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Product Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#F5F3EF] border border-[#D8D5CF] p-8 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#D8D5CF] pb-4">
                <h3 className="font-editorial text-2xl uppercase text-[#111111]">
                  Add New Silhouette
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)}>
                  <X className="w-5 h-5 text-[#6B6B6B]" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block mb-1">
                    Piece Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Kinetic Wool Bomber"
                    className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-white border border-[#D8D5CF] px-2 py-2 text-xs text-[#111111]"
                    >
                      <option value="MEN">MEN</option>
                      <option value="WOMEN">WOMEN</option>
                      <option value="ACCESSORIES">ACCESSORIES</option>
                      <option value="NEW ARRIVALS">NEW ARRIVALS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      required
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block mb-1">
                    Editorial Description
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#D8D5CF]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-[#D8D5CF] text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#111111] text-[#F5F3EF] text-xs uppercase font-medium hover:bg-black"
                  >
                    Save & Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#F5F3EF] border border-[#D8D5CF] p-8 max-w-md w-full space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#D8D5CF] pb-4">
                <h3 className="font-editorial text-2xl uppercase text-[#111111]">
                  Edit Silhouette
                </h3>
                <button onClick={() => setEditingProduct(null)}>
                  <X className="w-5 h-5 text-[#6B6B6B]" />
                </button>
              </div>

              <form onSubmit={handleSaveEditProduct} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block mb-1">
                    Piece Name
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] block mb-1">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stockCount}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })}
                      className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#D8D5CF]">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 border border-[#D8D5CF] text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#111111] text-[#F5F3EF] text-xs uppercase font-medium hover:bg-black"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
