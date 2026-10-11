"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Address {
  id: string;
  isDefault?: boolean;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UserOrder {
  id: string;
  date: string;
  status: "Processing" | "In Atelier" | "Dispatched" | "Delivered" | "Cancelled";
  trackingNumber: string;
  total: number;
  paymentMethod?: string;
  transactionId?: string;
  items: {
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  addresses: Address[];
  orders: UserOrder[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string, role?: "admin" | "customer") => Promise<{ success: boolean; requiresVerification?: boolean; email?: string; error?: string }>;
  loginDemoPatron: () => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; requiresOtp?: boolean; email?: string; devOtp?: string; emailSent?: boolean; emailError?: string; error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string; retryAfter?: number; devOtp?: string; emailSent?: boolean; emailError?: string; error?: string }>;
  logout: () => void;
  deactivateAccount: (password: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: "admin" | "customer") => void;
  addOrder: (order: Omit<UserOrder, "id" | "date" | "status" | "trackingNumber">) => UserOrder;
  updateAddress: (address: Address) => void;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; devOtp?: string; error?: string }>;
  verifyResetOtp: (email: string, otp: string) => Promise<{ success: boolean; resetToken?: string; message?: string; error?: string }>;
  resendResetOtp: (email: string) => Promise<{ success: boolean; message?: string; retryAfter?: number; devOtp?: string; error?: string }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export const DEFAULT_USER: User = {
  id: "usr_noir_01",
  name: "Alexander Vance",
  email: "alexander@noir.studio",
  role: "customer",
  addresses: [
    {
      id: "addr_1",
      isDefault: true,
      name: "Alexander Vance",
      street: "740 Park Avenue, Apt 14B",
      city: "New York",
      state: "NY",
      postalCode: "10021",
      country: "United States",
    },
  ],
  orders: [
    {
      id: "ORD-9482-NR",
      date: "2026-09-28",
      status: "In Atelier",
      trackingNumber: "NR-9982410-US",
      total: 374,
      paymentMethod: "Visa Platinum (•••• 8892)",
      transactionId: "TXN-CC-9982410",
      items: [
        {
          name: "NOIR MOTION JACKET",
          size: "L",
          color: "Black",
          quantity: 1,
          price: 189,
          image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop",
        },
        {
          name: "Shadow Oversized Tee",
          size: "L",
          color: "Washed Black",
          quantity: 1,
          price: 85,
          image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
        },
      ],
    },
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Unauthenticated by default: guests cannot purchase or add items to cart without signing in
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isLoggedIn = localStorage.getItem("noir_logged_in") === "true";
    const stored = localStorage.getItem("noir_auth_user");
    const adminAuth = localStorage.getItem("noir_admin_authenticated") === "true";

    if (isLoggedIn && stored) {
      try {
        const parsed: User = JSON.parse(stored);
        if (adminAuth) {
          parsed.role = "admin";
        }
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse auth storage", e);
        setUser(null);
      }
    } else if (adminAuth) {
      setUser({
        ...DEFAULT_USER,
        id: "usr_curator_admin",
        name: "Curator Admin",
        email: "admin@noir.studio",
        role: "admin",
      });
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (user) {
        localStorage.setItem("noir_auth_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("noir_auth_user");
      }
    }
  }, [user, isMounted]);

  const login = async (
    email: string,
    password?: string,
    role: "admin" | "customer" = "customer"
  ): Promise<{ success: boolean; requiresVerification?: boolean; email?: string; error?: string }> => {
    const isExplicitAdmin = role === "admin" || email.toLowerCase().includes("admin");

    try {
      // 1. Call backend authentication API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "noir2026" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          requiresVerification: data.requiresVerification,
          email: data.email,
          error: data.error || "Authentication failed. Please verify credentials.",
        };
      }

      const isDemoAlexander = email.toLowerCase() === "alexander@noir.studio";
      const authenticatedUser: User = {
        id: data.user?.id || (isDemoAlexander ? DEFAULT_USER.id : `usr_${Date.now()}`),
        name: data.user?.name || (isDemoAlexander ? DEFAULT_USER.name : email.split("@")[0].replace(".", " ").toUpperCase()),
        email: data.user?.email || email,
        role: data.user?.role || (isExplicitAdmin ? "admin" : role),
        addresses: data.user?.addresses || (isDemoAlexander ? DEFAULT_USER.addresses : []),
        orders: data.user?.orders || (isDemoAlexander ? DEFAULT_USER.orders : []),
      };

      if (data.token) {
        localStorage.setItem("noir_token", data.token);
      }
      if (authenticatedUser.role === "admin") {
        localStorage.setItem("noir_admin_authenticated", "true");
      }
      localStorage.setItem("noir_logged_in", "true");
      localStorage.setItem("noir_auth_user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return { success: true };
    } catch (err: any) {
      console.warn("[Auth] Backend login API unreachable, using local fallback:", err.message);
      // Fallback for offline environments
      const isDemoAlexander = email.toLowerCase() === "alexander@noir.studio";
      const fallbackUser: User = {
        id: isDemoAlexander ? DEFAULT_USER.id : `usr_${Date.now()}`,
        email,
        name: isDemoAlexander ? DEFAULT_USER.name : email.split("@")[0].replace(".", " ").toUpperCase(),
        role: isExplicitAdmin ? "admin" : role,
        addresses: isDemoAlexander ? DEFAULT_USER.addresses : [],
        orders: isDemoAlexander ? DEFAULT_USER.orders : [],
      };
      if (isExplicitAdmin) {
        localStorage.setItem("noir_admin_authenticated", "true");
      }
      localStorage.setItem("noir_logged_in", "true");
      localStorage.setItem("noir_auth_user", JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return { success: true };
    }
  };

  const loginDemoPatron = async () => {
    await login("alexander@noir.studio", "noir2026", "customer");
  };

  const adminLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPassword = (password || "").trim();

    if (!normalizedEmail || !normalizedPassword) {
      return {
        success: false,
        error: "Missing credentials: Both administrator email and passkey must be provided.",
      };
    }

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Authentication failed. Access denied.",
        };
      }

      if (data.token) {
        localStorage.setItem("noir_token", data.token);
        localStorage.setItem("noir_admin_token", data.token);
      }

      const adminUser: User = {
        id: data.user?.id || "usr_curator_admin",
        name: data.user?.name || "Curator Admin",
        email: normalizedEmail,
        role: "admin",
        addresses: user?.addresses || DEFAULT_USER.addresses,
        orders: user?.orders || DEFAULT_USER.orders,
      };

      localStorage.setItem("noir_admin_authenticated", "true");
      localStorage.setItem("noir_logged_in", "true");
      localStorage.setItem("noir_auth_user", JSON.stringify(adminUser));
      setUser(adminUser);
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Unable to connect to atelier authentication service.",
      };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem("noir_token");
    localStorage.removeItem("noir_admin_authenticated");
    localStorage.removeItem("noir_logged_in");
    localStorage.removeItem("noir_auth_user");
    setUser(null);
  };

  const register = async (
    name: string,
    email: string,
    password?: string
  ): Promise<{ success: boolean; requiresOtp?: boolean; email?: string; devOtp?: string; emailSent?: boolean; emailError?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || "noir2026" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Registration failed.",
        };
      }

      // If OTP verification is required (standard flow)
      if (data.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          email: data.email || email,
          devOtp: data.devOtp,
          emailSent: data.emailSent,
          emailError: data.emailError,
        };
      }

      const newUser: User = {
        id: data.user?.id || `usr_${Date.now()}`,
        name: data.user?.name || name,
        email: data.user?.email || email,
        role: data.user?.role || "customer",
        addresses: [],
        orders: [],
      };
      if (data.token) {
        localStorage.setItem("noir_token", data.token);
      }
      localStorage.setItem("noir_logged_in", "true");
      localStorage.setItem("noir_auth_user", JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Unable to connect to authentication server. Please check your connection.",
      };
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Verification failed.",
        };
      }

      const verifiedUser: User = {
        ...DEFAULT_USER,
        id: data.user?.id || `usr_${Date.now()}`,
        name: data.user?.name || email.split("@")[0].toUpperCase(),
        email: data.user?.email || email,
        role: data.user?.role || "customer",
        addresses: [],
        orders: [],
      };

      if (data.token) {
        localStorage.setItem("noir_token", data.token);
      }
      localStorage.setItem("noir_logged_in", "true");
      localStorage.setItem("noir_auth_user", JSON.stringify(verifiedUser));
      setUser(verifiedUser);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to communicate with verification server.",
      };
    }
  };

  const resendOtp = async (
    email: string
  ): Promise<{ success: boolean; message?: string; retryAfter?: number; devOtp?: string; emailSent?: boolean; emailError?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Failed to resend verification code.",
        };
      }

      return {
        success: true,
        message: data.message,
        retryAfter: data.retryAfter,
        devOtp: data.devOtp,
        emailSent: data.emailSent,
        emailError: data.emailError,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to resend code.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("noir_token");
    localStorage.removeItem("noir_admin_authenticated");
    localStorage.removeItem("noir_logged_in");
    localStorage.removeItem("noir_auth_user");
    setUser(null);
  };

  const deactivateAccount = async (
    password: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem("noir_token");
      const res = await fetch("/api/auth/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          password,
          reason,
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Failed to deactivate account.",
        };
      }

      // Deactivation succeeded: perform full logout
      logout();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Connection error during account deactivation.",
      };
    }
  };

  const switchRole = (role: "admin" | "customer") => {
    if (role === "admin") {
      localStorage.setItem("noir_admin_authenticated", "true");
    } else {
      localStorage.removeItem("noir_admin_authenticated");
    }
    if (user) {
      setUser({ ...user, role });
    } else {
      setUser({ ...DEFAULT_USER, role });
    }
  };

  const addOrder = (orderData: Omit<UserOrder, "id" | "date" | "status" | "trackingNumber">): UserOrder => {
    const newOrder: UserOrder = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}-NR`,
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      trackingNumber: `NR-${Math.floor(1000000 + Math.random() * 9000000)}-EXP`,
    };

    if (user) {
      setUser({
        ...user,
        orders: [newOrder, ...user.orders],
      });
    }

    return newOrder;
  };

  const updateAddress = (address: Address) => {
    if (!user) return;
    const exists = user.addresses.some((a) => a.id === address.id);
    let newAddresses: Address[];
    if (exists) {
      newAddresses = user.addresses.map((a) => (a.id === address.id ? address : a));
    } else {
      newAddresses = [...user.addresses, address];
    }
    setUser({ ...user, addresses: newAddresses });
  };

  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string; devOtp?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || data.message || "Failed to dispatch recovery code.",
        };
      }
      return {
        success: true,
        message: data.message,
        devOtp: data._devOtp || data.devOtp,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Unable to reach security service.",
      };
    }
  };

  const verifyResetOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; resetToken?: string; message?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || data.message || "Invalid or expired passcode.",
        };
      }
      return {
        success: true,
        resetToken: data.resetToken,
        message: data.message,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to verify passcode.",
      };
    }
  };

  const resendResetOtp = async (
    email: string
  ): Promise<{ success: boolean; message?: string; retryAfter?: number; devOtp?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/resend-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          retryAfter: data.retryAfter,
          error: data.error || data.message || "Failed to resend recovery passcode.",
        };
      }
      return {
        success: true,
        message: data.message,
        retryAfter: data.retryAfter,
        devOtp: data._devOtp || data.devOtp,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Unable to dispatch fresh code.",
      };
    }
  };

  const resetPassword = async (
    resetToken: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || data.message || "Failed to reset passkey.",
        };
      }
      logout();
      return {
        success: true,
        message: data.message,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to communicate with security service.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        loginDemoPatron,
        register,
        verifyOtp,
        resendOtp,
        logout,
        deactivateAccount,
        switchRole,
        addOrder,
        updateAddress,
        adminLogin,
        adminLogout,
        forgotPassword,
        verifyResetOtp,
        resendResetOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
