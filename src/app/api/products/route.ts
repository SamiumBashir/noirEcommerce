import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS, getLiveProducts, saveLiveProduct } from "@/lib/data/products";
import { ProductValidationSchema } from "@/lib/validations/product";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    const conn = await connectToDatabase();
    if (conn) {
      const filter: any = {};
      if (category && category !== "ALL") {
        filter.category = category.toUpperCase();
      }
      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ];
      }
      const dbProducts = await ProductModel.find(filter).lean();
      if (dbProducts.length > 0) {
        const normalized = dbProducts.map((p: any) => ({
          ...p,
          id: p.id || p.slug || (p._id ? p._id.toString() : ""),
          isNew: p.isNew !== undefined ? p.isNew : (p.isNewPiece !== undefined ? p.isNewPiece : true),
        }));
        return NextResponse.json({ success: true, count: normalized.length, data: normalized });
      }
    }

    // Live in-memory catalog fallback
    let results = [...getLiveProducts()];
    if (category && category !== "ALL") {
      results = results.filter((p) => p.category === category.toUpperCase());
    }
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ProductValidationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const baseSlug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = baseSlug || `piece-${Date.now()}`;
    const id = `noir-${slug}-${Date.now().toString().slice(-4)}`;

    const newProduct: any = {
      id,
      slug,
      name: data.name,
      subtitle: data.subtitle || "",
      category: data.category,
      gender: data.gender || "Unisex",
      price: data.price,
      originalPrice: data.originalPrice,
      rating: 5.0,
      reviewCount: 0,
      isNew: data.isNew !== undefined ? data.isNew : true,
      isNewPiece: data.isNew !== undefined ? data.isNew : true,
      isBestSeller: data.isBestSeller || false,
      isFeatured: data.isFeatured || false,
      inStock: data.inStock !== undefined ? data.inStock : true,
      stockCount: data.stockCount || 10,
      colors: data.colors && data.colors.length > 0 ? data.colors : [
        { name: "Noir Black", hex: "#111111", image: data.images[0] }
      ],
      sizes: data.sizes && data.sizes.length > 0 ? data.sizes : ["S", "M", "L", "XL"],
      description: data.description,
      details: data.details && data.details.length > 0 ? data.details : [
        "Architectural cut with precision atelier construction",
        "Engineered for fluid motion and structured silhouette"
      ],
      shippingInfo: data.shippingInfo || "Complimentary global shipping. 2-4 business days delivery.",
      careInstructions: data.careInstructions || "Specialist dry clean only.",
      images: data.images,
    };

    // Update live in-memory catalogue
    saveLiveProduct(newProduct);

    // Persist to MongoDB if connection available
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const created = await ProductModel.create(newProduct);
        const doc = created.toObject ? created.toObject() : created;
        const normalized = {
          ...doc,
          id: doc.id || doc.slug || newProduct.id,
          isNew: doc.isNew !== undefined ? doc.isNew : newProduct.isNew,
        };
        return NextResponse.json({ success: true, data: normalized }, { status: 201 });
      } catch (dbErr: any) {
        console.warn("MongoDB create failed, saved in memory:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
