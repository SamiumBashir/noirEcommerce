import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { OrderModel } from "@/lib/db/models/Order";
import { PRODUCTS, Product } from "@/lib/data/products";
import { getCustomProductsFromFile } from "@/lib/server/productPersistence";
import { initiateSslcommerzPayment } from "@/lib/sslcommerz";

const InitiatePaymentSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(6, "Valid phone number is required"),
  shippingAddress: z.object({
    street: z.string().min(2, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(1, "State / Province is required"),
    postalCode: z.string().min(2, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
  }),
  deliveryMethod: z.enum(["standard", "priority"]).default("standard"),
  userId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        color: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Cart must contain at least one item"),
});

// Exchange rate: 1 USD = 120 BDT
const USD_TO_BDT_RATE = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = InitiatePaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid checkout information",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliveryMethod,
      userId,
      items,
    } = validation.data;

    // Connect to database
    await connectToDatabase();

    // 1. Fetch live product catalog from MongoDB + persistence disk + baseline PRODUCTS
    // to verify product prices and availability SERVER-SIDE
    let mongoProducts: any[] = [];
    try {
      mongoProducts = await ProductModel.find({}).lean();
    } catch {
      // fallback to disk / memory
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

    // 2. Validate all products and calculate subtotal strictly server-side
    const validatedProducts = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const product = findProduct(item.productId);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `Garment reference "${item.productId}" is not available in our atelier catalog.`,
          },
          { status: 404 }
        );
      }

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
      if (isNaN(itemPrice) || itemPrice <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid catalog pricing for "${product.name}".`,
          },
          { status: 500 }
        );
      }

      serverSubtotal += itemPrice * item.quantity;

      validatedProducts.push({
        productId: product.id || product.slug,
        name: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: itemPrice, // Server-verified price only
        image: product.images?.[0] || "",
      });
    }

    // 3. Server-side shipping and total calculation
    const shippingFee = deliveryMethod === "priority" ? 45 : serverSubtotal >= 250 ? 0 : 25;
    const totalAmount = serverSubtotal + shippingFee;
    const payableAmountBdt = Math.round(totalAmount * USD_TO_BDT_RATE);

    // 4. Generate unique IDs
    const timestampSuffix = Date.now().toString().slice(-5);
    const randomSalt = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${randomSalt}`;
    const transactionId = `TXN-${orderId}-${timestampSuffix}`;
    const trackingNumber = `NR-${Math.floor(1000000 + Math.random() * 9000000)}-EXP`;

    // 5. Create Order in MongoDB with paymentStatus = "PENDING"
    const orderRecord = {
      orderId,
      orderNumber: orderId,
      userId: userId || undefined,
      customerName,
      customerEmail,
      customerPhone,
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
      paymentMethod: "SSLCOMMERZ",
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      status: "PENDING",
      transactionId,
      validationStatus: "UNVERIFIED",
      trackingNumber,
    };

    let savedOrder;
    try {
      savedOrder = await OrderModel.create(orderRecord);
    } catch (dbErr: any) {
      console.error("[Order] Failed to create pending order in MongoDB:", dbErr);
      return NextResponse.json(
        {
          success: false,
          error: "Could not create atelier order record. Please try again.",
        },
        { status: 500 }
      );
    }

    // Extract actual request origin from caller (handles custom domains, Vercel deployments, and localhost automatically)
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const callerSiteUrl = host ? `${proto}://${host}` : undefined;

    // 6. Call SSLCOMMERZ to initiate payment session
    const firstProductName = validatedProducts[0]?.name || "Noir Garments";
    const sslInitiateResult = await initiateSslcommerzPayment({
      orderId,
      transactionId,
      amount: payableAmountBdt,
      currency: "BDT",
      customerName,
      customerEmail,
      customerPhone,
      customerAddress: `${shippingAddress.street}, ${shippingAddress.city}`,
      customerCity: shippingAddress.city,
      customerState: shippingAddress.state,
      customerPostcode: shippingAddress.postalCode,
      customerCountry: shippingAddress.country,
      productName: validatedProducts.length > 1 ? `${firstProductName} + more` : firstProductName,
      productCategory: "Luxury Fashion",
      deliveryMethod,
      siteBaseUrl: callerSiteUrl,
    });

    if (!sslInitiateResult.success || !sslInitiateResult.gatewayPageUrl) {
      console.error("[SSLCOMMERZ] Payment initiation failure:", sslInitiateResult.error);
      return NextResponse.json(
        {
          success: false,
          error: sslInitiateResult.error || "Failed to initialize SSLCOMMERZ gateway session",
          orderId,
        },
        { status: 502 }
      );
    }

    // Save sessionKey to order record
    if (sslInitiateResult.sessionKey && savedOrder) {
      await OrderModel.updateOne(
        { orderId },
        { $set: { sslSessionKey: sslInitiateResult.sessionKey } }
      );
    }

    // Return GatewayPageURL to client for redirection
    return NextResponse.json({
      success: true,
      gatewayPageUrl: sslInitiateResult.gatewayPageUrl,
      orderId,
      transactionId,
      totalAmount,
      payableAmountBdt,
    });
  } catch (error: any) {
    console.error("[SSLCOMMERZ Initiate Exception]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred while initiating payment.",
      },
      { status: 500 }
    );
  }
}
