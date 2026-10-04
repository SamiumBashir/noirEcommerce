import fs from "fs";
import path from "path";
import { Product } from "@/lib/data/products";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "lib", "data", "custom-products.json");

let memoryStore: Product[] = [];

/**
 * Loads custom products persistently from disk with in-memory caching
 */
export function getCustomProductsFromFile(): Product[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          memoryStore = parsed;
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("Could not read custom-products.json:", err);
  }
  return memoryStore;
}

/**
 * Persists a new or updated product to disk
 */
export function saveCustomProductToFile(product: Product): void {
  try {
    const list = getCustomProductsFromFile();
    const idx = list.findIndex((p) => p.id === product.id || p.slug === product.slug);
    if (idx !== -1) {
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    memoryStore = list;

    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to custom-products.json (using memory fallback):", err);
    const idx = memoryStore.findIndex((p) => p.id === product.id || p.slug === product.slug);
    if (idx !== -1) {
      memoryStore[idx] = product;
    } else {
      memoryStore.unshift(product);
    }
  }
}

/**
 * Deletes a product from persistent storage on disk
 */
export function deleteCustomProductFromFile(idOrSlug: string): void {
  try {
    const list = getCustomProductsFromFile();
    const filtered = list.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
    memoryStore = filtered;

    if (fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not delete from custom-products.json:", err);
    memoryStore = memoryStore.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
  }
}

/**
 * Merges custom products with the baseline catalog
 */
export function mergeWithSeedProducts(customProducts: Product[], seedProducts: Product[]): Product[] {
  const customMap = new Map<string, Product>();
  customProducts.forEach((p) => {
    if (p.id) customMap.set(p.id, p);
    if (p.slug) customMap.set(p.slug, p);
  });

  const result: Product[] = [...customProducts];
  seedProducts.forEach((sp) => {
    if (!customMap.has(sp.id) && !customMap.has(sp.slug)) {
      result.push(sp);
    }
  });

  return result;
}
