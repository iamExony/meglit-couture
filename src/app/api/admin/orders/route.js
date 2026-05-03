import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { listOrders } from "@/lib/store";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;
  return NextResponse.json({ orders: await listOrders() });
}
