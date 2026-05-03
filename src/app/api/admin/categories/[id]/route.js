import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../../convex/_generated/api";
import { logActivity } from "@/lib/store";

export async function PUT(request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  try {
    const body = await request.json();
    const args = { id };
    if (body.name !== undefined) args.name = String(body.name);
    if (body.description !== undefined) args.description = String(body.description);
    if (body.subcategories !== undefined) {
      args.subcategories = Array.isArray(body.subcategories) ? body.subcategories : [];
    }
    const cat = await convex().mutation(api.categories.update, args);
    logActivity({ actor: user.username, action: "category.update", target: cat?.name });
    return NextResponse.json({ category: cat });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(_req, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  try {
    await convex().mutation(api.categories.remove, { id });
    logActivity({ actor: user.username, action: "category.delete", target: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to delete" }, { status: 400 });
  }
}
