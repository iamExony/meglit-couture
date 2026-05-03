import { NextResponse } from "next/server";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../convex/_generated/api";
import { sendContactMessageEmail } from "@/lib/mail";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const phone = String(body?.phone || "").trim();
  const subject = String(body?.subject || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Name, email and message are required." }, { status: 400 });
  }
  if (!EMAIL_RX.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ ok: false, error: "Message is too long." }, { status: 400 });
  }

  try {
    await convex().mutation(api.contactMessages.create, {
      name,
      email,
      phone: phone || undefined,
      subject: subject || undefined,
      message,
    });
  } catch (err) {
    console.error("[contact] persist failed", err);
  }

  try {
    const result = await sendContactMessageEmail({ name, email, phone, subject, message });
    if (result?.error) {
      console.error("[contact] mail error", result.error);
    }
  } catch (err) {
    console.error("[contact] mail throw", err);
  }

  return NextResponse.json({ ok: true });
}
