import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;

  const [payouts, vendors] = await Promise.all([
    convex().query(api.vendors.listPayouts, {}),
    convex().query(api.vendors.list, {}),
  ]);

  const vendorMap = Object.fromEntries((vendors || []).map((v) => [String(v._id), v]));
  const enriched = (payouts || []).map((p) => ({
    ...p,
    vendor: vendorMap[String(p.vendorId)] || null,
  })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return NextResponse.json({ payouts: enriched });
}
