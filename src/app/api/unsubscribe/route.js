import { NextResponse } from "next/server";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../convex/_generated/api";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req) {
  const url = new URL(req.url);
  const email = String(url.searchParams.get("email") || "").trim();
  if (!EMAIL_RX.test(email)) {
    return new NextResponse("Invalid email", { status: 400 });
  }
  try {
    await convex().mutation(api.subscribers.unsubscribe, { email });
  } catch (err) {
    console.error("[unsubscribe] failed", err);
  }
  return new NextResponse(
    `<!doctype html><html><head><title>Unsubscribed</title></head><body style="font-family:sans-serif;max-width:520px;margin:80px auto;text-align:center;color:#1a1a1a;"><h1 style="font-weight:600;">You're unsubscribed</h1><p style="color:#666;">${email} won't receive any more newsletters from Meglit Couture.</p></body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
