import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { deletePurchase, logActivity } from "@/lib/store";

export async function DELETE(_request, { params }) {
  const { user, response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const ok = await deletePurchase(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  logActivity({ actor: user.username, action: "purchase.delete", target: id });
  return NextResponse.json({ success: true });
}
