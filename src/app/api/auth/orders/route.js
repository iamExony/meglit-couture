import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";
import { verifyCustomerToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  const session = await verifyCustomerToken(token);
  if (!session) return NextResponse.json({ orders: [] }, { status: 401 });
  try {
    const orders = await convex().query(api.orders.listByCustomer, {
      customerId: session.id,
      email: session.email,
    });
    return NextResponse.json({ orders: orders || [] });
  } catch (err) {
    console.error("[auth/orders] failed", err);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
