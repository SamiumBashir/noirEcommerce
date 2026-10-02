import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/data/products";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: CATEGORIES,
  });
}
