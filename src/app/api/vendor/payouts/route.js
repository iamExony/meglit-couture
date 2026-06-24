import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyVendorToken, VENDOR_COOKIE } from "@/lib/vendorAuth";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(VENDOR_COOKIE)?.value;
  const session = await verifyVendorToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await convex().query(api.vendors.get, { id: session.id });
  if (!vendor || vendor.status !== "active") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payouts = await convex().query(api.vendors.listPayouts, { vendorId: vendor._id });
  return NextResponse.json({ payouts: payouts.sort((a, b) => b.createdAt - a.createdAt) });
}
