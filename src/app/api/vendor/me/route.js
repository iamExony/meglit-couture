import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyVendorToken, VENDOR_COOKIE } from "@/lib/vendorAuth";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(VENDOR_COOKIE)?.value;
  const session = await verifyVendorToken(token);
  if (!session) return NextResponse.json({ vendor: null });

  try {
    const vendor = await convex().query(api.vendors.get, { id: session.id });
    if (!vendor || vendor.status !== "active") return NextResponse.json({ vendor: null });
    return NextResponse.json({
      vendor: {
        id: vendor._id,
        storeName: vendor.storeName,
        contactName: vendor.contactName,
        email: vendor.email,
        phone: vendor.phone,
        totalEarnings: vendor.totalEarnings || 0,
        pendingPayout: vendor.pendingPayout || 0,
        totalPaidOut: vendor.totalPaidOut || 0,
      },
    });
  } catch {
    return NextResponse.json({ vendor: null });
  }
}
