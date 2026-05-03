import { NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus, logActivity, claimOrderReceipt, getOrder } from "@/lib/store";
import { sendOrderReceiptEmail } from "@/lib/mail";

// Paystack sends events to this URL. Configure it in your Paystack dashboard:
//   Settings → API Keys & Webhooks → Webhook URL
// e.g. https://undepressible-kena-protractedly.ngrok-free.dev/api/paystack/webhook
//
// Paystack signs every request with HMAC-SHA512 of the raw body using your
// PAYSTACK_SECRET_KEY. We must verify this signature before trusting the payload.

export async function POST(request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
  }

  // Raw body required for signature verification
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const reference = event?.data?.reference;
    switch (event.event) {
      case "charge.success": {
        if (reference) {
          const order = await updateOrderStatus(reference, "paid") || await getOrder(reference);
          if (order) {
            const claimed = await claimOrderReceipt(reference);
            if (claimed) {
              const result = await sendOrderReceiptEmail(order);
              logActivity({
                actor: "mail",
                action: result?.error ? "receipt.failed" : "receipt.sent",
                target: reference,
                meta: result,
              });
            }
          }
        }
        logActivity({
          actor: "paystack",
          action: "payment.success",
          target: reference,
          meta: { amount: event?.data?.amount, currency: event?.data?.currency },
        });
        break;
      }
      case "charge.failed": {
        if (reference) {
          await updateOrderStatus(reference, "failed");
        }
        logActivity({
          actor: "paystack",
          action: "payment.failed",
          target: reference,
          meta: { reason: event?.data?.gateway_response },
        });
        break;
      }
      default:
        // Acknowledge other events without action
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paystack webhook] failed", err);
    // Return 200 so Paystack doesn't retry forever on app-side errors
    return NextResponse.json({ received: true, error: "handler failed" });
  }
}
