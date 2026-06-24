import { NextResponse } from "next/server";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";
import { hashPassword } from "@/lib/vendorAuth";
import { sendVendorApplicationConfirmEmail } from "@/lib/mail";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { storeName, contactName, email, phone, description, password } = body;
  if (!storeName || !contactName || !email || !password) {
    return NextResponse.json({ error: "Store name, contact name, email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const { hash, salt } = await hashPassword(password);
    await convex().mutation(api.vendors.apply, {
      storeName: storeName.trim(),
      contactName: contactName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      description: description?.trim() || undefined,
      passwordHash: hash,
      salt,
    });
    // Non-blocking — don't let email failure break the response
    sendVendorApplicationConfirmEmail({ to: email.trim(), storeName: storeName.trim() }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[vendor/apply] error:", err?.message || err);
    const msg = err?.message || "";
    if (msg.includes("already exists")) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not submit application. Please try again." }, { status: 500 });
  }
}
