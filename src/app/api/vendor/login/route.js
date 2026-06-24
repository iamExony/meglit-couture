import { NextResponse } from "next/server";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";
import { verifyPassword, createVendorToken, VENDOR_COOKIE, VENDOR_COOKIE_MAX_AGE } from "@/lib/vendorAuth";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const vendor = await convex().query(api.vendors.getByEmail, { email: email.toLowerCase() });
  if (!vendor) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  if (vendor.status === "pending") {
    return NextResponse.json({ error: "Your application is still under review. We'll notify you by email once approved." }, { status: 403 });
  }
  if (vendor.status === "rejected") {
    return NextResponse.json({ error: "Your vendor application was not approved." }, { status: 403 });
  }
  if (vendor.status === "suspended") {
    return NextResponse.json({ error: "Your vendor account has been suspended. Please contact Meglit support." }, { status: 403 });
  }

  const valid = await verifyPassword(password, vendor.passwordHash, vendor.salt);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createVendorToken({ id: vendor._id, email: vendor.email });

  const res = NextResponse.json({
    vendor: {
      id: vendor._id,
      storeName: vendor.storeName,
      contactName: vendor.contactName,
      email: vendor.email,
    },
  });
  res.cookies.set(VENDOR_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: VENDOR_COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(VENDOR_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
