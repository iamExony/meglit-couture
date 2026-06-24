import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../../convex/_generated/api";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

async function paystackPost(path, body) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// POST /api/admin/payouts/[id] — retry a failed or pending payout
export async function POST(request, { params }) {
  const { response } = await requireUser();
  if (response) return response;

  const { id } = await params;

  try {
    const payouts = await convex().query(api.vendors.listPayouts, {});
    const payout = (payouts || []).find((p) => p._id === id);
    if (!payout) return NextResponse.json({ error: "Payout not found." }, { status: 404 });
    if (payout.status === "paid") return NextResponse.json({ error: "Already paid." }, { status: 400 });

    const vendor = await convex().query(api.vendors.get, { id: payout.vendorId });
    if (!vendor) return NextResponse.json({ error: "Vendor not found." }, { status: 404 });

    if (!vendor.accountNumber || !vendor.bankCode) {
      return NextResponse.json({ error: "Vendor has no bank details on file." }, { status: 400 });
    }

    // Ensure recipient code
    let recipientCode = vendor.paystackRecipientCode;
    if (!recipientCode) {
      const recipientData = await paystackPost("/transferrecipient", {
        type: "nuban",
        name: vendor.accountName || vendor.storeName,
        account_number: vendor.accountNumber,
        bank_code: vendor.bankCode,
        currency: "NGN",
      });
      if (!recipientData.status || !recipientData.data?.recipient_code) {
        return NextResponse.json({ error: "Failed to create Paystack recipient." }, { status: 502 });
      }
      recipientCode = recipientData.data.recipient_code;
      await convex().mutation(api.vendors.updateBankDetails, {
        id: vendor._id,
        bankName: vendor.bankName || "",
        bankCode: vendor.bankCode,
        accountNumber: vendor.accountNumber,
        accountName: vendor.accountName || "",
        paystackRecipientCode: recipientCode,
      });
    }

    const transferRef = `MEGLIT-${id}-${Date.now()}`;
    const result = await paystackPost("/transfer", {
      source: "balance",
      amount: payout.vendorAmount * 100,
      recipient: recipientCode,
      reason: `Meglit payout — Order ${payout.orderReference || payout.orderId}`,
      reference: transferRef,
    });

    if (!result.status || !result.data?.transfer_code) {
      await convex().mutation(api.vendors.markPayoutFailed, { id });
      return NextResponse.json({ error: result.message || "Paystack transfer failed." }, { status: 502 });
    }

    await convex().mutation(api.vendors.markPayoutPaid, {
      id,
      paystackTransferCode: result.data.transfer_code,
      paystackTransferRef: transferRef,
    });
    await convex().mutation(api.vendors.updateEarnings, {
      id: payout.vendorId,
      subtractPending: payout.vendorAmount,
      addPaidOut: payout.vendorAmount,
    });

    return NextResponse.json({ ok: true, transferCode: result.data.transfer_code });
  } catch (err) {
    console.error("[admin/payouts retry] error:", err?.message || err);
    return NextResponse.json({ error: "Retry failed. Check server logs." }, { status: 500 });
  }
}
