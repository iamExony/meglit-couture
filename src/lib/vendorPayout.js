import { convex } from "@/lib/convexServer";
import { api } from "../../convex/_generated/api";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

async function paystackPost(path, body) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function ensureRecipient(vendor) {
  if (vendor.paystackRecipientCode) return vendor.paystackRecipientCode;
  if (!vendor.accountNumber || !vendor.bankCode) return null;

  const data = await paystackPost("/transferrecipient", {
    type: "nuban",
    name: vendor.accountName || vendor.storeName,
    account_number: vendor.accountNumber,
    bank_code: vendor.bankCode,
    currency: "NGN",
  });

  if (data.status && data.data?.recipient_code) {
    await convex().mutation(api.vendors.updateBankDetails, {
      id: vendor._id,
      bankName: vendor.bankName || "",
      bankCode: vendor.bankCode,
      accountNumber: vendor.accountNumber,
      accountName: vendor.accountName || "",
      paystackRecipientCode: data.data.recipient_code,
    });
    return data.data.recipient_code;
  }
  return null;
}

export async function triggerVendorPayouts(order) {
  if (!order?.items?.length) return;

  // Get commission rate from settings (default 15%)
  const settingsRow = await convex().query(api.settings.get, { key: "vendor_commission_rate" });
  const commissionRate = settingsRow?.value ?? 0.15;

  // Get all products that belong to vendors
  const allProducts = await convex().query(api.products.list, {});
  const productMap = Object.fromEntries(allProducts.map((p) => [String(p._id), p]));

  // Group item totals by vendor
  // Cart items spread the full product: _id is always present, id/productId may not be.
  const vendorTotals = {};
  for (const item of order.items) {
    const key = String(item._id || item.productId || item.id || "");
    const product = productMap[key];
    if (!product?.vendorId) continue;
    const vendorId = String(product.vendorId);
    const itemTotal = (item.price || product.price) * (item.quantity || 1);
    vendorTotals[vendorId] = (vendorTotals[vendorId] || 0) + itemTotal;
  }

  for (const [vendorId, saleAmount] of Object.entries(vendorTotals)) {
    const commissionAmount = Math.round(saleAmount * commissionRate);
    const vendorAmount = saleAmount - commissionAmount;

    // Create payout record
    const payoutId = await convex().mutation(api.vendors.createPayout, {
      vendorId,
      orderId: order._id || order.id,
      orderReference: order.legacyId || order.reference,
      saleAmount,
      commissionRate,
      commissionAmount,
      vendorAmount,
    });

    // Update vendor pending earnings
    await convex().mutation(api.vendors.updateEarnings, {
      id: vendorId,
      addPending: vendorAmount,
    });

    // Attempt Paystack transfer
    try {
      const vendor = await convex().query(api.vendors.get, { id: vendorId });
      const recipientCode = await ensureRecipient(vendor);

      if (recipientCode) {
        const transferRef = `MEGLIT-${payoutId}-${Date.now()}`;
        const result = await paystackPost("/transfer", {
          source: "balance",
          amount: vendorAmount * 100, // Paystack expects kobo
          recipient: recipientCode,
          reason: `Meglit sale payout — Order ${order.legacyId || order.reference}`,
          reference: transferRef,
        });

        if (result.status && result.data?.transfer_code) {
          await convex().mutation(api.vendors.markPayoutPaid, {
            id: payoutId,
            paystackTransferCode: result.data.transfer_code,
            paystackTransferRef: transferRef,
          });
          await convex().mutation(api.vendors.updateEarnings, {
            id: vendorId,
            subtractPending: vendorAmount,
            addPaidOut: vendorAmount,
          });
        }
      }
    } catch (err) {
      // Payout record exists — admin can retry manually
      console.error(`[payout] Transfer failed for vendor ${vendorId}:`, err?.message);
    }
  }
}
