import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { sendVendorInviteEmail } from "@/lib/mail";

export async function POST(request) {
  const { response } = await requireUser();
  if (response) return response;

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email } = body;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const base = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const inviteUrl = `${base}/become-a-vendor`;

  const result = await sendVendorInviteEmail({ to: email.trim(), inviteUrl });
  if (result.skipped) return NextResponse.json({ ok: true, skipped: true });
  if (result.error) return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
