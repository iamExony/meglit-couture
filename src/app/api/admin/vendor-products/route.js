import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET(request) {
  const { response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending_review";

  try {
    const all = await convex().query(api.products.list, {});
    const products = (all || []).filter((p) => p.vendorStatus === status);
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[admin/vendor-products] query error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Failed to load products." }, { status: 500 });
  }
}
