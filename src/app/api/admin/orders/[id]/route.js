import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getOrder, updateOrderStatus, logActivity } from "@/lib/store";
import { triggerVendorPayouts } from "@/lib/vendorPayout";

const ALLOWED_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

export async function GET(_request, { params }) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  try {
    const { status } = await request.json();
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const order = await updateOrderStatus(id, status);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    logActivity({ actor: user.username, action: "order.status", target: order.id, meta: { status } });
    if (status === "delivered") {
      // Fire-and-forget: trigger vendor payouts in background
      triggerVendorPayouts(order).catch((err) =>
        console.error("[payout] triggerVendorPayouts error:", err?.message)
      );
    }
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
