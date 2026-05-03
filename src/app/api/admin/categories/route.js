import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";
import { logActivity } from "@/lib/store";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;
  const categories = await convex().query(api.categories.list, {});
  return NextResponse.json({ categories });
}

export async function POST(request) {
  const { user, response } = await requireUser();
  if (response) return response;
  try {
    const body = await request.json();
    const cat = await convex().mutation(api.categories.create, {
      name: String(body.name || "").trim(),
      slug: body.slug ? String(body.slug) : undefined,
      description: body.description ? String(body.description) : undefined,
      subcategories: Array.isArray(body.subcategories) ? body.subcategories : [],
    });
    logActivity({ actor: user.username, action: "category.create", target: cat?.name });
    return NextResponse.json({ category: cat }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to create category" }, { status: 400 });
  }
}
