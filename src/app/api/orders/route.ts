import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/Order";
import { ProductModel } from "@/lib/db/models/Product";
import { PRODUCTS } from "@/lib/data/products";
import { getCustomProductsFromFile } from "@/lib/server/productPersistence";
import { getAuthenticatedUser } from "@/lib/security/authGuard";

const CreateOrderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(3, "Street address required"),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State / Region required"),
    postalCode: z.string().min(2, "Postal code required"),
    country: z.string().min(2, "Country required"),
  }),
  deliveryMethod: z.enum(["standard", "priority"]).default("standard"),
  paymentMethod: z.enum(["COD", "SSLCOMMERZ", "Card", "bKash"]).default("COD"),
  userId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive("Quantity must be positive"),
        size: z.string().default("M"),
        color: z.string().default("Black"),
        name: z.string().optional(),
        price: z.number().optional(),
        image: z.string().optional(),
      })
    )
    .min(1, "Order must contain at least one item"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get("paymentStatus");
    const orderStatus = searchParams.get("orderStatus");
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    // Access control: Only admins can list all orders across all customers
    const authUser = getAuthenticatedUser(request);
    const isAdmin = authUser?.role === "admin";

    if (!isAdmin && !userId && !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Please specify email or userId parameter to query your orders, or log in as administrator.",
        },
        { status: 401 }
      );
    }

    const conn = await connectToDatabase();
    if (conn) {
      const query: any = {};
      if (paymentStatus && paymentStatus !== "ALL") {
        query.paymentStatus = paymentStatus.toUpperCase();
      }
      if (orderStatus && orderStatus !== "ALL") {
        query.orderStatus = orderStatus.toUpperCase();
      }

      if (!isAdmin) {
        // Enforce patron isolation
        if (userId && email) {
          query.$or = [{ userId }, { customerEmail: email.toLowerCase() }];
        } else if (userId) {
          query.userId = userId;
        } else if (email) {
          query.customerEmail = email.toLowerCase();
        }
      } else {
        // Admin can optionally filter by customer
        if (userId && email) {
          query.$or = [{ userId }, { customerEmail: email.toLowerCase() }];
        } else if (userId) {
          query.userId = userId;
        } else if (email) {
          query.customerEmail = email.toLowerCase();
        }
      }

      const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, count: orders.length, data: orders });
    }

    return NextResponse.json({
      success: true,
      count: 0,
      data: [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.format() },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      userId,
      items,
    } = validation.data;

    await connectToDatabase();

    // Build catalog lookup to verify prices server-side
    let mongoProducts: any[] = [];
    try {
      mongoProducts = await ProductModel.find({}).lean();
    } catch {
      // fallback
    }

    const customProducts = getCustomProductsFromFile();
    const allProducts = [...mongoProducts, ...customProducts, ...PRODUCTS];

    const findProduct = (targetId: string): any => {
      if (!targetId) return null;
      const cleanTarget = targetId.trim().toLowerCase();

      // 1. Exact or lowercase match on id, slug, or MongoDB _id string
      for (const p of allProducts) {
        const pid = (p.id || "").toString().trim().toLowerCase();
        const pslug = (p.slug || "").toString().trim().toLowerCase();
        const pmid = p._id ? p._id.toString().trim().toLowerCase() : "";
        if (pid === cleanTarget || pslug === cleanTarget || pmid === cleanTarget) {
          return p;
        }
      }

      // 2. Fallback match by product name
      for (const p of allProducts) {
        const pname = (p.name || "").toString().trim().toLowerCase();
        if (pname === cleanTarget || cleanTarget.includes((p.slug || "").toLowerCase())) {
          return p;
        }
      }

      return null;
    };

    // Validate and calculate subtotal server-side
    const validatedProducts = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const product = findProduct(item.productId);

      // Secure price check: Strictly reject unverified products to prevent price injection attacks
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `Product "${item.name || item.productId}" is not available in our catalogue.`,
          },
          { status: 400 }
        );
      }

      // Inventory check
      if (product.inStock === false || (product.stockCount !== undefined && product.stockCount < item.quantity)) {
        return NextResponse.json(
          {
            success: false,
            error: `"${product.name}" is currently out of stock for the requested quantity.`,
          },
          { status: 400 }
        );
      }

      const itemPrice = Number(product.price);
      serverSubtotal += itemPrice * item.quantity;

      validatedProducts.push({
        productId: product.id || product.slug,
        name: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: itemPrice,
        image: product.images?.[0] || "",
      });
    }

    const shippingFee = deliveryMethod === "priority" ? 45 : serverSubtotal >= 250 ? 0 : 25;
    const totalAmount = serverSubtotal + shippingFee;
    const payableAmountBdt = Math.round(totalAmount * 120);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
    const trackingNumber = `NR-${Math.floor(1000000 + Math.random() * 9000000)}-COD`;

    const orderRecord = {
      orderId,
      orderNumber: orderId,
      userId: userId || undefined,
      customerName,
      customerEmail,
      customerPhone: customerPhone || "",
      shippingAddress,
      deliveryMethod,
      products: validatedProducts,
      items: validatedProducts,
      subtotal: serverSubtotal,
      shippingFee,
      shippingCost: shippingFee,
      discount: 0,
      totalAmount,
      total: totalAmount,
      currency: "BDT",
      payableAmountBdt,
      paymentMethod: paymentMethod === "COD" ? "COD" : "SSLCOMMERZ",
      paymentStatus: "PENDING",
      orderStatus: "PROCESSING",
      status: "Processing",
      validationStatus: "UNVERIFIED",
      trackingNumber,
    };

    const saved = await OrderModel.create(orderRecord);

    // Atomic Stock Decrement for COD orders
    for (const item of validatedProducts) {
      await ProductModel.updateOne(
        { $or: [{ id: item.productId }, { slug: item.productId }] },
        { $inc: { stockCount: -item.quantity } }
      ).catch((err) => console.warn(`Stock decrement error for ${item.productId}:`, err));
    }

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    console.error("[Orders POST error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
