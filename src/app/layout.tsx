import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/animations/SmoothScroll";
import { AuthProvider } from "@/lib/context/AuthContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import { CartProvider } from "@/lib/context/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/animations/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NOIR — Designed For Those Who Move Differently",
  description:
    "A cinematic high-end fashion editorial and modern e-commerce platform. Sculptural silhouettes, architectural outerwear, and kinetic garments.",
  keywords: ["NOIR", "luxury fashion", "architectural clothing", "minimalist design", "high-end outerwear"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "NOIR — Designed For Those Who Move Differently",
    description: "Architectural outerwear and kinetic garments.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F5F3EF] text-[#111111] antialiased selection:bg-[#111111] selection:text-[#F5F3EF] flex flex-col font-sans"
      >
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <SmoothScrollProvider>
                <Navbar />
                <main className="flex-1 w-full">
                  <PageTransition>{children}</PageTransition>
                </main>
                <Footer />
              </SmoothScrollProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
