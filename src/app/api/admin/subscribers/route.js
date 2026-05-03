import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  const { user, response } = await requireAdmin();
  if (response) return response;
  void user;
  try {
    const subscribers = await convex().query(api.subscribers.list, {});
    return NextResponse.json({ subscribers });
  } catch (err) {
    console.error("[admin/subscribers] failed", err);
    return NextResponse.json({ subscribers: [], error: "Failed to load" }, { status: 500 });
  }
}
