import { NextResponse } from "next/server";
import { updateOrderStatus, getOrder, logActivity, claimOrderReceipt } from "@/lib/store";
import { sendOrderReceiptEmail } from "@/lib/mail";

// Server-side verification of a Paystack transaction.
// Called by the checkout page after the inline popup callback fires.
// Independently confirms with Paystack that the charge actually succeeded
// before marking the order as paid (defense against tampered client callbacks).

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" }
    );
    const data = await res.json();

    if (!data?.status) {
      return NextResponse.json(
        { verified: false, error: data?.message || "Verification failed" },
        { status: 400 }
      );
    }

    const tx = data.data || {};
    const paid = tx.status === "success";

    // Update the order in Convex (resolves by reference / legacyId / _id)
    const newStatus = paid ? "paid" : tx.status === "failed" ? "failed" : "pending";
    let order = null;
    try {
      order = await updateOrderStatus(reference, newStatus);
    } catch {
      // Order may not exist yet (race with webhook); fetch it anyway
    }
    if (!order) order = await getOrder(reference);

    logActivity({
      actor: "paystack",
      action: paid ? "payment.verified" : `payment.${tx.status || "unknown"}`,
      target: reference,
      meta: { amount: tx.amount, currency: tx.currency, channel: tx.channel },
    });

    // Send receipt email exactly once per order.
    if (paid && order) {
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

    return NextResponse.json({
      verified: paid,
      status: tx.status,
      amount: tx.amount,
      currency: tx.currency,
      reference,
      order,
    });
  } catch (err) {
    console.error("[paystack verify] failed", err);
    return NextResponse.json({ error: "Verification request failed" }, { status: 500 });
  }
}
