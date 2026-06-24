import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../../convex/_generated/api";

export async function PUT(request, { params }) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  try {
    const body = await request.json();
    const patch = {};
    if (body.message !== undefined) patch.message = String(body.message).trim();
    if (body.type !== undefined) patch.type = String(body.type);
    if ("code" in body) patch.code = body.code ? String(body.code).trim() : undefined;
    const ann = await convex().mutation(api.announcements.update, { id, ...patch });
    return NextResponse.json({ announcement: ann });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to update" }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  try {
    const ann = await convex().mutation(api.announcements.togglePublish, { id });
    return NextResponse.json({ announcement: ann });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to toggle" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  try {
    await convex().mutation(api.announcements.remove, { id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to delete" }, { status: 400 });
  }
}
