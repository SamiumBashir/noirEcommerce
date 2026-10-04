import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { PRODUCTS, getLiveProducts, saveLiveProduct, deleteLiveProduct } from "@/lib/data/products";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const conn = await connectToDatabase();
    if (conn) {
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
    }

    const product = getLiveProducts().find((p) => p.id === id || p.slug === id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
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

    // Update in-memory catalogue
    const catalog = getLiveProducts();
    const existing = catalog.find((p) => p.id === id || p.slug === id);
    let updatedMemory = null;
    if (existing) {
      updatedMemory = saveLiveProduct({ ...existing, ...body });
    }

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
          { new: true }
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
        console.warn("MongoDB update failed, updated in memory:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedMemory || { id, ...body },
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
    // Remove from in-memory catalogue
    deleteLiveProduct(id);

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
