import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { PRODUCTS, getLiveProducts, saveLiveProduct, deleteLiveProduct } from "@/lib/data/products";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import {
  getCustomProductsFromFile,
  saveCustomProductToFile,
  deleteCustomProductFromFile,
} from "@/lib/server/productPersistence";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // 1. Check MongoDB if connected
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const orConditions: any[] = [{ slug: id }, { id: id }];
        if (mongoose.Types.ObjectId.isValid(id)) {
          orConditions.push({ _id: id });
        }
        const dbProduct = await ProductModel.findOne({
          $or: orConditions,
        }).lean();
        if (dbProduct) {
          const normalized = {
            ...dbProduct,
            id: (dbProduct as any).id || (dbProduct as any).slug || (dbProduct as any)._id?.toString(),
            isNew: (dbProduct as any).isNew !== undefined ? (dbProduct as any).isNew : (dbProduct as any).isNewPiece,
          };
          return NextResponse.json({ success: true, data: normalized });
        }
      } catch (dbErr: any) {
        console.warn("MongoDB findOne failed:", dbErr.message);
      }
    }

    // 2. Check persistent disk file storage
    const customList = getCustomProductsFromFile();
    const diskProduct = customList.find((p) => p.id === id || p.slug === id);
    if (diskProduct) {
      return NextResponse.json({ success: true, data: diskProduct });
    }

    // 3. Check baseline seed catalog
    const seedProduct = PRODUCTS.find((p) => p.id === id || p.slug === id);
    if (seedProduct) {
      return NextResponse.json({ success: true, data: seedProduct });
    }

    // 4. Check in-memory fallback
    const memoryProduct = getLiveProducts().find((p) => p.id === id || p.slug === id);
    if (memoryProduct) {
      return NextResponse.json({ success: true, data: memoryProduct });
    }

    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();

    // 1. Update in persistent disk storage
    const customList = getCustomProductsFromFile();
    const existingDisk = customList.find((p) => p.id === id || p.slug === id);
    const existingSeed = PRODUCTS.find((p) => p.id === id || p.slug === id);
    const base = existingDisk || existingSeed || { id, slug: id };
    const updatedProduct = { ...base, ...body };
    saveCustomProductToFile(updatedProduct);

    // 2. Update in-memory catalogue
    const catalog = getLiveProducts();
    const existingMem = catalog.find((p) => p.id === id || p.slug === id);
    if (existingMem) {
      saveLiveProduct({ ...existingMem, ...body });
    } else {
      saveLiveProduct(updatedProduct);
    }

    // 3. Update MongoDB if connected
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const orConditions: any[] = [{ slug: id }, { id: id }];
        if (mongoose.Types.ObjectId.isValid(id)) {
          orConditions.push({ _id: id });
        }
        const updated = await ProductModel.findOneAndUpdate(
          { $or: orConditions },
          { $set: body },
          { new: true, upsert: true }
        ).lean();
        if (updated) {
          const normalized = {
            ...updated,
            id: (updated as any).id || (updated as any).slug || (updated as any)._id?.toString(),
            isNew: (updated as any).isNew !== undefined ? (updated as any).isNew : (updated as any).isNewPiece,
          };
          return NextResponse.json({ success: true, data: normalized });
        }
      } catch (dbErr: any) {
        console.warn("MongoDB update failed, updated in disk storage:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    // 1. Remove from persistent disk storage
    deleteCustomProductFromFile(id);

    // 2. Remove from in-memory catalogue
    deleteLiveProduct(id);

    // 3. Remove from MongoDB if connected
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const orConditions: any[] = [{ slug: id }, { id: id }];
        if (mongoose.Types.ObjectId.isValid(id)) {
          orConditions.push({ _id: id });
        }
        await ProductModel.findOneAndDelete({
          $or: orConditions,
        });
      } catch (dbErr: any) {
        console.warn("MongoDB delete failed:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
