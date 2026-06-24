import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyVendorToken, VENDOR_COOKIE } from "@/lib/vendorAuth";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(VENDOR_COOKIE)?.value;
  const session = await verifyVendorToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await convex().query(api.vendors.get, { id: session.id });
  if (!vendor || vendor.status !== "active") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find orders that contain products from this vendor
  const allOrders = await convex().query(api.orders.list, {});
  const allProducts = await convex().query(api.products.list, {});
  const vendorProductIds = new Set(
    allProducts.filter((p) => p.vendorId === vendor._id).map((p) => String(p._id))
  );

  // Cart items spread the full product object: _id is always present,
  // id is only present if the product was fetched through normalizeProduct.
  function itemMatchesVendor(item) {
    const candidates = [item._id, item.id, item.productId].filter(Boolean);
    return candidates.some((c) => vendorProductIds.has(String(c)));
  }

  const vendorOrders = allOrders
    .filter((order) => (order.items || []).some(itemMatchesVendor))
    .map((order) => ({
      ...order,
      items: (order.items || []).filter(itemMatchesVendor),
    }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return NextResponse.json({ orders: vendorOrders });
}
