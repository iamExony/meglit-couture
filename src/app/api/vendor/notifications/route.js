import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyVendorToken, VENDOR_COOKIE } from "@/lib/vendorAuth";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(VENDOR_COOKIE)?.value;
  const session = await verifyVendorToken(token);
  if (!session) return NextResponse.json({ newOrders: 0 });

  const vendor = await convex().query(api.vendors.get, { id: session.id });
  if (!vendor || vendor.status !== "active") return NextResponse.json({ newOrders: 0 });

  const [allOrders, allProducts] = await Promise.all([
    convex().query(api.orders.list, {}),
    convex().query(api.products.list, {}),
  ]);

  const vendorProductIds = new Set(
    allProducts.filter((p) => p.vendorId === vendor._id).map((p) => String(p._id))
  );

  function itemMatchesVendor(item) {
    return [item._id, item.id, item.productId].filter(Boolean)
      .some((c) => vendorProductIds.has(String(c)));
  }

  // Orders placed in the last 48 hours containing vendor products
  const since = Date.now() - 48 * 60 * 60 * 1000;
  const newOrders = allOrders.filter((order) => {
    const createdAt = typeof order.createdAt === "number"
      ? order.createdAt
      : new Date(order.createdAt || 0).getTime();
    return createdAt >= since && (order.items || []).some(itemMatchesVendor);
  }).length;

  return NextResponse.json({ newOrders });
}
