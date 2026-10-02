import mongoose, { Schema, Model } from "mongoose";

export interface IProduct {
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  gender: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isNewPiece: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  inStock: boolean;
  stockCount: number;
  colors: { name: string; hex: string; image: string }[];
  sizes: string[];
  description: string;
  details: string[];
  shippingInfo: string;
  careInstructions: string;
  images: string[];
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    subtitle: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    gender: { type: String, default: "Unisex" },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    isNewPiece: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 10 },
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
        image: { type: String, required: true },
      },
    ],
    sizes: [{ type: String }],
    description: { type: String, required: true },
    details: [{ type: String }],
    shippingInfo: { type: String, default: "Complimentary global shipping." },
    careInstructions: { type: String, default: "Specialist dry clean only." },
    images: [{ type: String, required: true }],
  },
  { timestamps: true }
);

export const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
