import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/Order";
import { getSiteBaseUrl } from "@/lib/sslcommerz";

async function handleCancelCallback(request: NextRequest) {
  const siteUrl = getSiteBaseUrl();

  try {
    let payload: Record<string, string> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = value.toString();
      });
    } else if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        payload[key] = value;
      });
    }

    const tran_id = payload.tran_id || payload.tranId;
    const orderId = payload.value_a || payload.orderId;

    console.log(`[SSLCOMMERZ Cancel] Transaction cancelled by client for order: ${orderId}, tran_id: ${tran_id}`);

    await connectToDatabase();

    const orQuery: any[] = [];
    if (orderId) orQuery.push({ orderId });
    if (tran_id) orQuery.push({ transactionId: tran_id });

    if (orQuery.length > 0) {
      await OrderModel.updateOne(
        { $or: orQuery, paymentStatus: { $ne: "PAID" } },
        {
          $set: {
            paymentStatus: "CANCELLED",
            "paymentDetails.cancellationReason": "Client cancelled at SSLCOMMERZ gateway",
          },
        }
      );
    }

    const queryParams = new URLSearchParams({
      orderId: orderId || "",
      tranId: tran_id || "",
    });

    return NextResponse.redirect(`${siteUrl}/payment/cancelled?${queryParams.toString()}`, 303);
  } catch (error: any) {
    console.error("[SSLCOMMERZ Cancel Handler Error]:", error);
    return NextResponse.redirect(`${siteUrl}/payment/cancelled?reason=error`, 303);
  }
}

export async function POST(request: NextRequest) {
  return handleCancelCallback(request);
}

export async function GET(request: NextRequest) {
  return handleCancelCallback(request);
}
