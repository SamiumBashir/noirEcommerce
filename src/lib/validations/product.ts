import { z } from "zod";

export const ProductValidationSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  subtitle: z.string().optional().default(""),
  category: z.enum(["MEN", "WOMEN", "ACCESSORIES", "NEW ARRIVALS"]),
  gender: z.enum(["Men", "Women", "Unisex"]).default("Unisex"),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  stockCount: z.number().int().nonnegative().default(10),
  description: z.string().min(10, "Description must be at least 10 characters"),
  sizes: z.array(z.string()).default(["S", "M", "L"]),
  images: z.array(z.string().url()).min(1, "At least one image URL is required"),
  colors: z
    .array(
      z.object({
        name: z.string(),
        hex: z.string(),
        image: z.string(),
      })
    )
    .default([]),
});

export const OrderValidationSchema = z.object({
  customerEmail: z.string().email("Valid email required"),
  customerName: z.string().min(2, "Name required"),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  deliveryMethod: z.enum(["standard", "priority"]).default("standard"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        size: z.string(),
        color: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        image: z.string(),
      })
    )
    .min(1, "Order must contain at least one item"),
});
