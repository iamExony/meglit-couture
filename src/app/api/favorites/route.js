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
  if (!session) return NextResponse.json({ favorites: [] }, { status: 401 });
  try {
    const rows = await convex().query(api.favorites.list, { customerId: session.id });
    return NextResponse.json({
      favorites: (rows || []).map((r) => r.productId),
    });
  } catch (err) {
    console.error("[favorites GET] failed", err);
    return NextResponse.json({ favorites: [] }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await requireCustomer();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const productId = String(body?.productId || "").trim();
  if (!productId) return NextResponse.json({ ok: false, error: "productId required" }, { status: 400 });
  try {
    const result = await convex().mutation(api.favorites.toggle, {
      customerId: session.id,
      productId,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[favorites POST] failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
