import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/Order";
import { initiateSslcommerzPayment } from "@/lib/sslcommerz";

const RetryPaymentSchema = z.object({
  orderId: z.string().min(3, "Order ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RetryPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid retry request payload" },
        { status: 400 }
      );
    }

    const { orderId } = validation.data;

    await connectToDatabase();

    const order = await OrderModel.findOne({
      $or: [{ orderId }, { orderNumber: orderId }],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: "This order has already been verified and paid.",
          isPaid: true,
          orderId: order.orderId,
        },
        { status: 400 }
      );
    }

    // Generate new unique transactionId for this retry attempt
    const newTransactionId = `TXN-${order.orderId}-${Date.now().toString().slice(-6)}`;
    const payableAmountBdt = order.payableAmountBdt || Math.round(order.totalAmount * 120);

    // Update order with new transaction ID and reset status to PENDING
    await OrderModel.updateOne(
      { orderId: order.orderId },
      {
        $set: {
          transactionId: newTransactionId,
          paymentStatus: "PENDING",
          validationStatus: "UNVERIFIED",
        },
      }
    );

    // Extract caller site URL
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const callerSiteUrl = host ? `${proto}://${host}` : undefined;

    // Call SSLCOMMERZ
    const firstProductName = order.products?.[0]?.name || "Noir Garments";
    const sslResult = await initiateSslcommerzPayment({
      orderId: order.orderId,
      transactionId: newTransactionId,
      amount: payableAmountBdt,
      currency: order.currency || "BDT",
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || "01700000000",
      customerAddress: `${order.shippingAddress?.street || ""}, ${order.shippingAddress?.city || ""}`,
      customerCity: order.shippingAddress?.city,
      customerState: order.shippingAddress?.state,
      customerPostcode: order.shippingAddress?.postalCode,
      customerCountry: order.shippingAddress?.country,
      productName: order.products?.length > 1 ? `${firstProductName} + more` : firstProductName,
      productCategory: "Luxury Fashion",
      deliveryMethod: order.deliveryMethod,
      siteBaseUrl: callerSiteUrl,
    });

    if (!sslResult.success || !sslResult.gatewayPageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: sslResult.error || "Failed to initialize SSLCOMMERZ retry session",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      gatewayPageUrl: sslResult.gatewayPageUrl,
      orderId: order.orderId,
      transactionId: newTransactionId,
    });
  } catch (error: any) {
    console.error("[SSLCOMMERZ Retry Payment Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Retry payment failed" },
      { status: 500 }
    );
  }
}
