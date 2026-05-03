import { NextResponse } from "next/server";
import { getOrder } from "@/lib/store";

export async function GET(_request, { params }) {
  const { ref } = await params;
  if (!ref) return NextResponse.json({ error: "ref is required" }, { status: 400 });
  const order = await getOrder(ref);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
