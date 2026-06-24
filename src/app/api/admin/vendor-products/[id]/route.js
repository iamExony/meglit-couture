import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../../convex/_generated/api";

export async function PATCH(request, { params }) {
  const { response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { action } = body;
  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  try {
    const vendorStatus = action === "approve" ? "approved" : "rejected";
    await convex().mutation(api.products.update, { id, patch: { vendorStatus } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[admin/vendor-products/${id}] error:`, err?.message || err);
    return NextResponse.json({ error: "Action failed." }, { status: 500 });
  }
}
