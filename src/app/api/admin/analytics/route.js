import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getAnalytics } from "@/lib/store";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;
  try {
    return NextResponse.json(await getAnalytics());
  } catch (err) {
    console.error("[analytics] failed", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
