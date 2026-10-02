"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useAuth } from "@/lib/context/AuthContext";
import { SearchModal } from "@/components/layout/SearchModal";
import { CartDrawer } from "@/components/layout/CartDrawer";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const { cartCount, setIsCartOpen, lastAddedItem } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "SHOP", href: "/shop" },
    { label: "COLLECTION", href: "/shop?filter=featured" },
    { label: "LOOKBOOK", href: "/lookbook" },
    { label: "ABOUT", href: "/about" },
  ];

  const isLightHeroPage = pathname === "/" && !isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? "py-3 bg-[#F5F3EF]/90 backdrop-blur-md border-b border-[#D8D5CF]/60 shadow-sm"
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          {/* Logo Left */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`font-editorial tracking-[0.25em] text-2xl md:text-3xl font-bold uppercase transition-colors duration-300 ${
                isLightHeroPage
                  ? "text-white"
                  : "text-[#111111]"
              }`}
            >
              NOIR
            </Link>
          </div>

          {/* Navigation Center (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200 relative py-1 ${
                    isLightHeroPage
                      ? "text-white/90 hover:text-white"
                      : "text-[#111111]/80 hover:text-[#111111]"
                  } ${isActive ? "font-semibold" : ""}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className={`absolute bottom-0 left-0 right-0 h-[1.5px] ${
                        isLightHeroPage ? "bg-white" : "bg-[#111111]"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions Right */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search garments"
              className={`p-1.5 transition-colors duration-200 hover:opacity-70 ${
                isLightHeroPage ? "text-white" : "text-[#111111]"
              }`}
            >
              <Search className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Account */}
            <Link
              href={user ? "/account" : "/login"}
              aria-label="Customer Account"
              className={`p-1.5 transition-colors duration-200 hover:opacity-70 ${
                isLightHeroPage ? "text-white" : "text-[#111111]"
              }`}
            >
              <User className="w-4 h-4 stroke-[1.75]" />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={`relative p-1.5 transition-colors duration-200 hover:opacity-70 ${
                isLightHeroPage ? "text-white" : "text-[#111111]"
              }`}
            >
              <Heart className="w-4 h-4 stroke-[1.75]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#111111] text-[#F5F3EF] text-[9px] font-bold flex items-center justify-center border border-white/40">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Bag"
              className={`relative p-1.5 transition-colors duration-200 hover:opacity-70 ${
                isLightHeroPage ? "text-white" : "text-[#111111]"
              }`}
            >
              <motion.div
                key={lastAddedItem ? lastAddedItem.id : "static"}
                animate={lastAddedItem ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              </motion.div>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#111111] text-[#F5F3EF] text-[9px] font-bold flex items-center justify-center border border-white/40"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className={`md:hidden p-1.5 transition-colors ${
                isLightHeroPage ? "text-white" : "text-[#111111]"
              }`}
            >
              <Menu className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Full-Screen Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#111111] text-[#F5F3EF] flex flex-col p-6 sm:p-10 justify-between overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <span className="font-editorial tracking-[0.25em] text-2xl font-bold uppercase">
                NOIR
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white/80 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex flex-col gap-6 py-12">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08, duration: 0.5 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-editorial text-3xl sm:text-4xl uppercase tracking-wider hover:text-white/60 transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="pt-6 border-t border-white/10 flex flex-col gap-4 text-xs uppercase tracking-widest text-[#6B6B6B]"
              >
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/80 hover:text-white flex items-center justify-between"
                >
                  <span>Wishlist</span>
                  <span>({wishlistCount})</span>
                </Link>
                <Link
                  href={user ? "/account" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/80 hover:text-white flex items-center justify-between"
                >
                  <span>Account</span>
                  <span>{user ? user.name : "Sign In"}</span>
                </Link>
              </motion.div>
            </div>

            {/* Footer / Manifesto */}
            <div className="border-t border-white/10 pt-6 text-[11px] text-white/50 tracking-wider">
              <p>&ldquo;Designed for those who move differently.&rdquo;</p>
              <p className="mt-1">Paris • New York • Tokyo</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
