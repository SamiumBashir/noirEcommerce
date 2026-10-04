import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/data/products";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { getCustomProductsFromFile } from "@/lib/server/productPersistence";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: "MongoDB not connected. Please verify MONGODB_URI in .env.local" },
        { status: 500 }
      );
    }

    // Merge baseline PRODUCTS with any custom products in custom-products.json
    const customFromFile = getCustomProductsFromFile();
    const productMap = new Map();

    PRODUCTS.forEach((p) => {
      productMap.set(p.slug || p.id, {
        ...p,
        isNewPiece: p.isNew ?? true,
      });
    });

    customFromFile.forEach((p) => {
      productMap.set(p.slug || p.id, {
        ...p,
        isNewPiece: p.isNew ?? true,
      });
    });

    const allItems = Array.from(productMap.values());

    // Upsert each item to MongoDB
    let upsertedCount = 0;
    for (const item of allItems) {
      await ProductModel.findOneAndUpdate(
        { $or: [{ id: item.id }, { slug: item.slug }] },
        { $set: item },
        { upsert: true, new: true }
      );
      upsertedCount++;
    }

    const totalInDb = await ProductModel.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Successfully seeded MongoDB Atlas (${totalInDb} total products in database)`,
      seededCount: upsertedCount,
      totalInDb,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Seeding failed" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
