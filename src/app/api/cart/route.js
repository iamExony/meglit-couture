import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../convex/_generated/api";
import { verifyCustomerToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";

async function requireCustomer() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  return await verifyCustomerToken(token);
}

export async function GET() {
  const session = await requireCustomer();
  if (!session) return NextResponse.json({ items: [] }, { status: 401 });
  try {
    const row = await convex().query(api.carts.get, { customerId: session.id });
    return NextResponse.json({ items: row?.items || [] });
  } catch (err) {
    console.error("[cart GET] failed", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = await requireCustomer();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  try {
    await convex().mutation(api.carts.set, { customerId: session.id, items });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cart PUT] failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
