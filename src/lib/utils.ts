import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export const USD_TO_BDT_RATE = 120;

export function formatPriceBdt(usdPrice: number): string {
  const bdt = Math.round(usdPrice * USD_TO_BDT_RATE);
  return `৳${bdt.toLocaleString("en-BD")}`;
}

export function formatDualPrice(usdPrice: number): { usd: string; bdt: string; combined: string } {
  const usd = formatPrice(usdPrice);
  const bdt = formatPriceBdt(usdPrice);
  return {
    usd,
    bdt,
    combined: `${usd} (~ ${bdt})`,
  };
}
