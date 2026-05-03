import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { listActivities } from "@/lib/store";

export async function GET(request) {
  const { user, response } = await requireAdmin();
  if (response) return response;
  void user;
  const url = new URL(request.url);
  const actor = url.searchParams.get("actor") || undefined;
  const limit = Number(url.searchParams.get("limit")) || 200;
  return NextResponse.json({ activities: await listActivities({ actor, limit }) });
}
