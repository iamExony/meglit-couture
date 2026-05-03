import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { listCustomers } from "@/lib/store";

export async function GET() {
  const { user, response } = await requireAdmin();
  if (response) return response;
  void user;
  try {
    const customers = await listCustomers();
    return NextResponse.json({ customers });
  } catch (err) {
    console.error("[admin/customers] failed", err);
    return NextResponse.json({ customers: [], error: "Failed to load" }, { status: 500 });
  }
}
