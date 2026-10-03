import { NextRequest, NextResponse } from "next/server";
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
      const dbProduct = await ProductModel.findOne({
        $or: [{ _id: id }, { slug: id }, { id }],
      }).lean();
      if (dbProduct) {
        return NextResponse.json({ success: true, data: dbProduct });
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
        const updated = await ProductModel.findOneAndUpdate(
          { $or: [{ _id: id }, { slug: id }] },
          { $set: body },
          { new: true }
        );
        if (updated) {
          return NextResponse.json({ success: true, data: updated });
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
        await ProductModel.findOneAndDelete({
          $or: [{ _id: id }, { slug: id }],
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
