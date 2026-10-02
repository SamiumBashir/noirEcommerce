import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/data/products";

export async function GET() {
  const stats = {
    grossRevenue: 28450,
    activeOrders: 18,
    totalProducts: PRODUCTS.length,
    activeCustomers: 132,
    conversionRate: "3.84%",
    averageOrderValue: 245,
    topCategories: [
      { name: "MEN", share: "45%" },
      { name: "WOMEN", share: "35%" },
      { name: "ACCESSORIES", share: "20%" },
    ],
  };

  return NextResponse.json({
    success: true,
    data: stats,
  });
}
