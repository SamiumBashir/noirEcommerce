import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/Order";

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

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
