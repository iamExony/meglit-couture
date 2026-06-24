import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  const settings = await convex().query(api.settings.getAll, {});
  return NextResponse.json({ settings });
}

export async function POST(request) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  await convex().mutation(api.settings.set, { key, value, updatedBy: user.username });
  return NextResponse.json({ ok: true });
}
