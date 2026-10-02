import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/data/products";
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

    const product = PRODUCTS.find((p) => p.id === id || p.slug === id);
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

    const conn = await connectToDatabase();
    if (conn) {
      const updated = await ProductModel.findOneAndUpdate(
        { $or: [{ _id: id }, { slug: id }] },
        { $set: body },
        { new: true }
      );
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...body },
      message: "Product updated in session",
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
    const conn = await connectToDatabase();
    if (conn) {
      await ProductModel.findOneAndDelete({
        $or: [{ _id: id }, { slug: id }],
      });
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
