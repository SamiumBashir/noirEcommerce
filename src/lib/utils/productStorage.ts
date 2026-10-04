import { Product } from "@/lib/data/products";

const STORAGE_KEY = "noir_custom_admin_products";

export function getCustomProductsFromStorage(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomProductToStorage(product: Product): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomProductsFromStorage();
    const idx = existing.findIndex((p) => p.id === product.id || p.slug === product.slug);
    if (idx !== -1) {
      existing[idx] = product;
    } else {
      existing.unshift(product);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn("Failed to save to localStorage:", err);
  }
}

export function deleteCustomProductFromStorage(idOrSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomProductsFromStorage();
    const filtered = existing.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Failed to delete from localStorage:", err);
  }
}

/**
 * Merges local storage custom products with base products list
 * Ensures custom products are always present and never lost across serverless invocations
 */
export function mergeWithCustomProducts(baseProducts: Product[]): Product[] {
  const custom = getCustomProductsFromStorage();
  if (custom.length === 0) return baseProducts;

  const customMap = new Map<string, Product>();
  custom.forEach((p) => {
    if (p.id) customMap.set(p.id, p);
    if (p.slug) customMap.set(p.slug, p);
  });

  const result: Product[] = [...custom];
  baseProducts.forEach((bp) => {
    if (!customMap.has(bp.id) && !customMap.has(bp.slug)) {
      result.push(bp);
    }
  });

  return result;
}
