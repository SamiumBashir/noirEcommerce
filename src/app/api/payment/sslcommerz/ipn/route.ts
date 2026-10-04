import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/Order";
import { validateSslcommerzPayment } from "@/lib/sslcommerz";

export async function POST(request: NextRequest) {
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

    const val_id = payload.val_id || payload.valId;
    const tran_id = payload.tran_id || payload.tranId;
    const orderId = payload.value_a || payload.orderId;
    const status = (payload.status || "").toUpperCase();

    console.log(`[SSLCOMMERZ IPN Received] orderId: ${orderId}, tran_id: ${tran_id}, status: ${status}, val_id: ${val_id}`);

    if (!val_id || (!tran_id && !orderId)) {
      console.warn("[SSLCOMMERZ IPN] Incomplete IPN notification data received:", payload);
      return NextResponse.json({ success: false, error: "Missing val_id or tran_id" }, { status: 400 });
    }

    await connectToDatabase();

    const orQuery: any[] = [];
    if (orderId) orQuery.push({ orderId });
    if (tran_id) orQuery.push({ transactionId: tran_id });

    const order = await OrderModel.findOne({ $or: orQuery });
    if (!order) {
      console.error(`[SSLCOMMERZ IPN] Order not found for tran_id: ${tran_id}, orderId: ${orderId}`);
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Idempotency: if order is already PAID, return 200 without modifying
    if (order.paymentStatus === "PAID") {
      console.log(`[SSLCOMMERZ IPN] Order ${order.orderId} already processed and marked PAID.`);
      return NextResponse.json({
        success: true,
        message: "Order already verified and paid",
        orderId: order.orderId,
      });
    }

    // Validate server-side with SSLCOMMERZ
    const validationResult = await validateSslcommerzPayment(val_id);
    if (!validationResult.isValid) {
      console.warn(`[SSLCOMMERZ IPN] Validation API marked transaction invalid for order ${order.orderId}:`, validationResult.error);
      await OrderModel.updateOne(
        { orderId: order.orderId },
        {
          $set: {
            paymentStatus: "FAILED",
            validationStatus: "FAILED",
            valId: val_id,
          },
        }
      );
      return NextResponse.json({ success: false, error: "Validation rejected by SSLCOMMERZ" }, { status: 400 });
    }

    // Verify Amount
    const paidAmount = Number(validationResult.amount);
    const expectedAmount = Number(order.payableAmountBdt || Math.round(order.totalAmount * 120));

    if (Math.abs(paidAmount - expectedAmount) > 2) {
      console.error(
        `[SSLCOMMERZ IPN ALERT] Amount mismatch for order ${order.orderId}! Expected ${expectedAmount}, received ${paidAmount}`
      );
      await OrderModel.updateOne(
        { orderId: order.orderId },
        {
          $set: {
            paymentStatus: "FAILED",
            validationStatus: "FAILED",
            valId: val_id,
          },
        }
      );
      return NextResponse.json({ success: false, error: "Amount verification failed" }, { status: 400 });
    }

    // Mark PAID
    await OrderModel.updateOne(
      { orderId: order.orderId },
      {
        $set: {
          paymentStatus: "PAID",
          orderStatus: "PROCESSING",
          status: "Processing",
          validationStatus: "VALIDATED",
          valId: validationResult.valId || val_id,
          bankTransactionId: validationResult.bankTranId || payload.bank_tran_id || "",
          paymentDetails: {
            cardType: validationResult.cardType || payload.card_type || "SSLCOMMERZ",
            cardNo: validationResult.cardNo || payload.card_no || "",
            cardIssuer: validationResult.cardIssuer || payload.card_issuer || "",
            cardBrand: validationResult.cardBrand || payload.card_brand || "",
            currencyType: validationResult.currency || "BDT",
            valId: val_id,
            tranDate: validationResult.tranDate || payload.tran_date || new Date().toISOString(),
            validatedAt: new Date(),
            source: "IPN",
          },
        },
      }
    );

    console.log(`[SSLCOMMERZ IPN Success] Order ${order.orderId} updated to PAID via IPN.`);
    return NextResponse.json({
      success: true,
      message: "IPN processed and order updated to PAID",
      orderId: order.orderId,
    });
  } catch (error: any) {
    console.error("[SSLCOMMERZ IPN Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
