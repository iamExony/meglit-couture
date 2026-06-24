import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;
  const announcements = await convex().query(api.announcements.list, {});
  return NextResponse.json({ announcements });
}

export async function POST(request) {
  const { response } = await requireUser();
  if (response) return response;
  try {
    const body = await request.json();
    const ann = await convex().mutation(api.announcements.create, {
      message: String(body.message || "").trim(),
      code: body.code ? String(body.code).trim() : undefined,
      type: String(body.type || "general"),
    });
    return NextResponse.json({ announcement: ann }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Failed to create" }, { status: 400 });
  }
}
