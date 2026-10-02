import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/data/products";
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
        return NextResponse.json({ success: true, count: dbProducts.length, data: dbProducts });
      }
    }

    // Static data fallback
    let results = [...PRODUCTS];
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
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newProduct = {
      ...data,
      slug,
      rating: 5.0,
      reviewCount: 0,
      isNewPiece: true,
      inStock: true,
      details: ["Japanese engineered weave", "Precision hand-tailoring"],
      shippingInfo: "Complimentary global shipping.",
      careInstructions: "Specialist dry clean only.",
    };

    const conn = await connectToDatabase();
    if (conn) {
      const created = await ProductModel.create(newProduct);
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: { id: `noir-${Date.now()}`, ...newProduct } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
