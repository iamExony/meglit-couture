import { NextResponse } from "next/server";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../convex/_generated/api";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const email = String(body?.email || "").trim();
  const name = String(body?.name || "").trim();
  const source = String(body?.source || "footer").trim();
  if (!EMAIL_RX.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  try {
    const result = await convex().mutation(api.subscribers.subscribe, {
      email,
      name: name || undefined,
      source,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[subscribe] failed", err);
    return NextResponse.json({ ok: false, error: "Subscription failed" }, { status: 500 });
  }
}
