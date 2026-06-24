import { NextResponse } from "next/server";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";
import { verifyResetToken, peekVendorId } from "@/lib/vendorResetToken";
import { hashPassword } from "@/lib/vendorAuth";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { token, password } = body;
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  // Peek at vendorId to look up the vendor (no security yet — just routing)
  const vendorId = peekVendorId(token);
  if (!vendorId) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
  }

  let vendor;
  try {
    vendor = await convex().query(api.vendors.get, { id: vendorId });
  } catch {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
  }

  if (!vendor) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
  }

  // Full cryptographic verification
  const result = await verifyResetToken(token, vendor);
  if (!result) {
    return NextResponse.json({ error: "This link has expired or already been used. Please request a new one." }, { status: 400 });
  }

  // Hash new password and update
  let hash, salt;
  try {
    ({ hash, salt } = await hashPassword(password));
  } catch (err) {
    console.error("[reset-password] hashPassword error:", err?.message || err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }

  try {
    await convex().mutation(api.vendors.updatePassword, { id: vendor._id, passwordHash: hash, salt });
  } catch (err) {
    console.error("[reset-password] mutation error:", err?.message || err);
    return NextResponse.json({ error: "Failed to update password. Please try again or contact support." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
