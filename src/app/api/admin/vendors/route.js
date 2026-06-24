import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET(request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const vendors = await convex().query(api.vendors.list, { status });
  return NextResponse.json({ vendors });
}
