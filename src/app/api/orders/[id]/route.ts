import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/Order";
import { getAuthenticatedUser, requireAdmin } from "@/lib/security/authGuard";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    await connectToDatabase();

    const orConditions: any[] = [
      { orderId: id },
      { orderNumber: id },
      { transactionId: id },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    const order = await OrderModel.findOne({ $or: orConditions }).lean();
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Access Control (BOLA/IDOR protection)
    const authUser = getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const verifyEmail = searchParams.get("email")?.trim().toLowerCase();

    const orderCreatedAt = order.createdAt ? new Date(order.createdAt).getTime() : 0;
    const isRecentOrder = Date.now() - orderCreatedAt < 30 * 60 * 1000;

    const isAuthorized =
      authUser?.role === "admin" ||
      (authUser?.email && authUser.email.toLowerCase() === (order.customerEmail || "").toLowerCase()) ||
      (authUser?.userId && authUser.userId === order.userId) ||
      (verifyEmail && verifyEmail === (order.customerEmail || "").toLowerCase()) ||
      isRecentOrder;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You are not authorized to view this order." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authCheck = requireAdmin(request);
  if (authCheck.errorResponse) {
    return authCheck.errorResponse;
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { orderStatus } = body;

    // Allowed statuses to update manually
    const validStatuses = ["PENDING", "PROCESSING", "In Atelier", "SHIPPED", "Dispatched", "DELIVERED", "Delivered", "CANCELLED", "Cancelled"];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid order status value" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const orConditions: any[] = [
      { orderId: id },
      { orderNumber: id },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    // Admins are prohibited from arbitrarily setting paymentStatus to PAID via manual patch
    const normalizedStatus = orderStatus.toUpperCase() === "IN ATELIER" ? "PROCESSING" : orderStatus.toUpperCase();

    const updated = await OrderModel.findOneAndUpdate(
      { $or: orConditions },
      {
        $set: {
          orderStatus: normalizedStatus,
          status: orderStatus, // keep display string
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Order status updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
