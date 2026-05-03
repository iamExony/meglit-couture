import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";
import { sendNewsletterEmail } from "@/lib/mail";
import { logActivity } from "@/lib/store";

function originFromReq(req) {
  const url = new URL(req.url);
  return process.env.PUBLIC_BASE_URL || `${url.protocol}//${url.host}`;
}

export async function POST(req) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const subject = String(body?.subject || "").trim();
  const bodyHtml = body?.bodyHtml ? String(body.bodyHtml) : "";
  const bodyText = String(body?.bodyText || "").trim();
  const audience = body?.audience === "all" ? "all" : "active";
  const testTo = body?.testTo ? String(body.testTo).trim() : "";

  if (!subject) return NextResponse.json({ ok: false, error: "Subject required" }, { status: 400 });
  if (!bodyHtml && !bodyText) return NextResponse.json({ ok: false, error: "Body required" }, { status: 400 });

  const origin = originFromReq(req);
  const buildUnsub = (email) => `${origin}/api/unsubscribe?email=${encodeURIComponent(email)}`;

  // Test send: just one recipient, don't touch the audience.
  if (testTo) {
    const result = await sendNewsletterEmail({
      to: testTo,
      subject: `[TEST] ${subject}`,
      bodyHtml,
      bodyText,
      unsubscribeUrl: buildUnsub(testTo),
    });
    if (result?.error) return NextResponse.json({ ok: false, error: String(result.error) }, { status: 500 });
    return NextResponse.json({ ok: true, test: true, id: result?.id });
  }

  let subs;
  try {
    subs = await convex().query(api.subscribers.list, {
      activeOnly: audience !== "all",
    });
  } catch (err) {
    console.error("[newsletter] load subs failed", err);
    return NextResponse.json({ ok: false, error: "Could not load subscribers" }, { status: 500 });
  }

  const recipients = (subs || []).map((s) => s.email).filter(Boolean);
  if (recipients.length === 0) {
    return NextResponse.json({ ok: false, error: "No subscribers in audience" }, { status: 400 });
  }

  let sent = 0;
  let failed = 0;
  const errors = [];
  // Send sequentially with small concurrency to respect Resend rate limits.
  const concurrency = 4;
  let cursor = 0;
  async function worker() {
    while (cursor < recipients.length) {
      const idx = cursor++;
      const email = recipients[idx];
      try {
        const result = await sendNewsletterEmail({
          to: email,
          subject,
          bodyHtml,
          bodyText,
          unsubscribeUrl: buildUnsub(email),
        });
        if (result?.error) {
          failed++;
          errors.push({ email, error: String(result.error?.message || result.error) });
        } else {
          sent++;
        }
      } catch (err) {
        failed++;
        errors.push({ email, error: String(err?.message || err) });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, recipients.length) }, worker));

  try {
    await logActivity({ actor: user?.username || "system", action: "newsletter.send", target: "newsletter", meta: { subject, sent, failed, audience } });
  } catch {}

  return NextResponse.json({ ok: true, sent, failed, total: recipients.length, errors: errors.slice(0, 10) });
}
