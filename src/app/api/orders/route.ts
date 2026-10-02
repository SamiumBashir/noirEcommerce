import { NextRequest, NextResponse } from "next/server";
import { OrderValidationSchema } from "@/lib/validations/product";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/Order";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, count: orders.length, data: orders });
    }

    return NextResponse.json({
      success: true,
      data: [
        {
          orderNumber: "ORD-9482-NR",
          customerName: "Alexander Vance",
          customerEmail: "alexander@noir.studio",
          status: "In Atelier",
          total: 374,
          trackingNumber: "NR-9982410-US",
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = OrderValidationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const subtotal = data.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const shippingCost = data.deliveryMethod === "priority" ? 45 : subtotal >= 250 ? 0 : 25;
    const total = subtotal + shippingCost;
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}-NR`;
    const trackingNumber = `NR-${Math.floor(1000000 + Math.random() * 9000000)}-EXP`;

    const orderRecord = {
      ...data,
      orderNumber,
      trackingNumber,
      subtotal,
      shippingCost,
      total,
      status: "Processing",
      paymentStatus: "Settled",
    };

    const conn = await connectToDatabase();
    if (conn) {
      const saved = await OrderModel.create(orderRecord);
      return NextResponse.json({ success: true, data: saved }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: orderRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
