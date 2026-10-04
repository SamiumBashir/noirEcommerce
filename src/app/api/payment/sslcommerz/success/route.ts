import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/Order";
import { validateSslcommerzPayment, getSiteBaseUrl } from "@/lib/sslcommerz";

async function handleSuccessCallback(request: NextRequest) {
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
      // Fallback to URL search parameters
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        payload[key] = value;
      });
    }

    const val_id = payload.val_id || payload.valId;
    const tran_id = payload.tran_id || payload.tranId;
    const orderId = payload.value_a || payload.orderId;
    const rawAmount = payload.amount;
    const currency = payload.currency || "BDT";

    if (!val_id || (!tran_id && !orderId)) {
      console.error("[SSLCOMMERZ Success] Missing val_id or transaction reference in payload:", payload);
      return NextResponse.redirect(
        `${siteUrl}/payment/failed?reason=missing_payment_parameters`,
        303
      );
    }

    await connectToDatabase();

    // 1. Locate order in database
    const orQuery: any[] = [];
    if (orderId) orQuery.push({ orderId });
    if (tran_id) orQuery.push({ transactionId: tran_id });

    const order = await OrderModel.findOne({ $or: orQuery });

    if (!order) {
      console.error(`[SSLCOMMERZ Success] Order not found for tran_id: ${tran_id}, orderId: ${orderId}`);
      return NextResponse.redirect(
        `${siteUrl}/payment/failed?reason=order_not_found`,
        303
      );
    }

    // 2. Idempotency Check: if already marked PAID, safely redirect to success page
    if (order.paymentStatus === "PAID") {
      console.log(`[SSLCOMMERZ Success] Order ${order.orderId} already paid. Redirecting cleanly.`);
      return NextResponse.redirect(
        `${siteUrl}/payment/success?orderId=${order.orderId}&tranId=${order.transactionId}`,
        303
      );
    }

    // 3. Strict Server-Side Validation using SSLCOMMERZ Validator API
    console.log(`[SSLCOMMERZ Success] Validating transaction with SSLCOMMERZ val_id: ${val_id}...`);
    const validationResult = await validateSslcommerzPayment(val_id);

    if (!validationResult.isValid) {
      console.error(`[SSLCOMMERZ Success] Validation API rejected transaction:`, validationResult.error);
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
      return NextResponse.redirect(
        `${siteUrl}/payment/failed?orderId=${order.orderId}&tranId=${order.transactionId}&reason=validation_rejected`,
        303
      );
    }

    // 4. Verify Amount & Currency
    const paidAmount = Number(validationResult.amount);
    const expectedAmount = Number(order.payableAmountBdt || Math.round(order.totalAmount * 120));

    // Allow max 1 BDT rounding tolerance
    if (Math.abs(paidAmount - expectedAmount) > 2) {
      console.error(
        `[SECURITY ALERT] Payment amount mismatch for order ${order.orderId}! Expected: ${expectedAmount} BDT, Received: ${paidAmount} BDT`
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
      return NextResponse.redirect(
        `${siteUrl}/payment/failed?orderId=${order.orderId}&tranId=${order.transactionId}&reason=amount_mismatch`,
        303
      );
    }

    // 5. Update Order to PAID in MongoDB
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
            currencyType: validationResult.currency || currency,
            valId: val_id,
            tranDate: validationResult.tranDate || payload.tran_date || new Date().toISOString(),
            validatedAt: new Date(),
          },
        },
      }
    );

    console.log(`[SSLCOMMERZ Success] Order ${order.orderId} verified and updated to PAID.`);

    return NextResponse.redirect(
      `${siteUrl}/payment/success?orderId=${order.orderId}&tranId=${order.transactionId}`,
      303
    );
  } catch (error: any) {
    console.error("[SSLCOMMERZ Success Handler Error]:", error);
    return NextResponse.redirect(
      `${siteUrl}/payment/failed?reason=internal_callback_error`,
      303
    );
  }
}

export async function POST(request: NextRequest) {
  return handleSuccessCallback(request);
}

export async function GET(request: NextRequest) {
  return handleSuccessCallback(request);
}
