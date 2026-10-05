import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { PRODUCTS, Product, getLiveProducts, saveLiveProduct, deleteLiveProduct } from "@/lib/data/products";
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
    const cleanId = id.trim().toLowerCase();
    const baseSlug = cleanId.replace(/^noir-/, "").replace(/-\d+$/, "");

    if (conn) {
      try {
        const orConditions: any[] = [
          { slug: id },
          { id: id },
          { slug: cleanId },
          { id: cleanId },
          { slug: baseSlug },
          { id: `noir-${baseSlug}` },
        ];
        if (mongoose.Types.ObjectId.isValid(id)) {
          orConditions.push({ _id: id });
        }
        let dbProduct = await ProductModel.findOne({ $or: orConditions }).lean();

        // Fallback: partial match on slug, id prefix, or name
        if (!dbProduct) {
          dbProduct = await ProductModel.findOne({
            $or: [
              { slug: new RegExp(`^${baseSlug}$`, "i") },
              { id: new RegExp(`^noir-${baseSlug}`, "i") },
              { name: new RegExp(`^${baseSlug.replace(/-/g, " ")}$`, "i") },
            ],
          }).lean();
        }

        if (dbProduct) {
          const raw = dbProduct as any;
          const defaultImage = "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop";
          const images = (Array.isArray(raw.images) && raw.images.length > 0 && raw.images[0])
            ? raw.images
            : [defaultImage];
          const colors = (Array.isArray(raw.colors) && raw.colors.length > 0)
            ? raw.colors
            : [{ name: "Noir Black", hex: "#111111", image: images[0] }];
          const sizes = (Array.isArray(raw.sizes) && raw.sizes.length > 0)
            ? raw.sizes
            : ["S", "M", "L", "XL"];
          const details = (Array.isArray(raw.details) && raw.details.length > 0)
            ? raw.details
            : [
                "Architectural silhouette with tailored ergonomic seams",
                "Heavyweight premium textile blend",
                "Hand-finished atelier accents",
              ];

          const normalized = {
            ...raw,
            id: raw.id || raw.slug || raw._id?.toString(),
            category: raw.category || "MEN",
            description: raw.description || "Archival tailored garment with sculptural proportions, engineered for movement and luxury comfort.",
            images,
            colors,
            sizes,
            details,
            shippingInfo: raw.shippingInfo || "Complimentary worldwide tracked courier delivery.",
            careInstructions: raw.careInstructions || "Specialist atelier dry clean only.",
            stockCount: typeof raw.stockCount === "number" ? raw.stockCount : 50,
            isNew: raw.isNew !== undefined ? raw.isNew : raw.isNewPiece,
            _id: raw._id?.toString(),
          };
          return NextResponse.json({ success: true, data: normalized });
        }
      } catch (dbErr: any) {
        console.warn("MongoDB findOne failed:", dbErr.message);
      }
    }

    // Match helper for local collections
    const matchItem = (p: Product) => {
      const pid = (p.id || "").toLowerCase();
      const pslug = (p.slug || "").toLowerCase();
      const pname = (p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return (
        pid === cleanId ||
        pslug === cleanId ||
        pslug === baseSlug ||
        pid.includes(baseSlug) ||
        pslug.includes(baseSlug) ||
        pname === baseSlug
      );
    };

    // 2. Check persistent disk file storage
    const customList = getCustomProductsFromFile();
    const diskProduct = customList.find(matchItem);
    if (diskProduct) {
      return NextResponse.json({ success: true, data: diskProduct });
    }

    // 3. Check baseline seed catalog
    const seedProduct = PRODUCTS.find(matchItem);
    if (seedProduct) {
      return NextResponse.json({ success: true, data: seedProduct });
    }

    // 4. Check in-memory fallback
    const memoryProduct = getLiveProducts().find(matchItem);
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
