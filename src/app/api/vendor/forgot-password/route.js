import { NextResponse } from "next/server";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";
import { createResetToken } from "@/lib/vendorResetToken";
import { sendVendorPasswordResetEmail } from "@/lib/mail";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email } = body;
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const vendor = await convex().query(api.vendors.getByEmail, { email: email.toLowerCase() }).catch(() => null);
  if (vendor && vendor.status === "active") {
    try {
      const token = await createResetToken(vendor);
      const base = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const resetUrl = `${base}/vendor/reset-password?token=${token}`;
      await sendVendorPasswordResetEmail({ to: vendor.email, storeName: vendor.storeName, resetUrl });
    } catch (err) {
      console.error("[forgot-password] error:", err?.message || err);
    }
  }

  return NextResponse.json({ ok: true });
}
