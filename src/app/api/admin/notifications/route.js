import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;

  const [pendingVendors, allProducts, allOrders, allPayouts] = await Promise.all([
    convex().query(api.vendors.list, { status: "pending" }),
    convex().query(api.products.list, {}),
    convex().query(api.orders.list, {}),
    convex().query(api.vendors.listPayouts, {}),
  ]);

  const pendingProducts = (allProducts || []).filter((p) => p.vendorStatus === "pending_review").length;

  const since = Date.now() - 24 * 60 * 60 * 1000;
  const newOrders = (allOrders || []).filter((o) => {
    const t = typeof o.createdAt === "number" ? o.createdAt : new Date(o.createdAt || 0).getTime();
    return t >= since;
  }).length;

  const failedPayouts = (allPayouts || []).filter((p) => p.status === "failed").length;

  return NextResponse.json({
    pendingVendors: pendingVendors.length,
    pendingProducts,
    newOrders,
    failedPayouts,
  });
}
