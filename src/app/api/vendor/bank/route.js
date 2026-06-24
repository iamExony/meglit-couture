import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyVendorToken, VENDOR_COOKIE } from "@/lib/vendorAuth";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

async function requireVendor() {
  const jar = await cookies();
  const token = jar.get(VENDOR_COOKIE)?.value;
  const session = await verifyVendorToken(token);
  if (!session) return null;
  return await convex().query(api.vendors.get, { id: session.id });
}

export async function GET() {
  const vendor = await requireVendor();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    bankName: vendor.bankName || "",
    bankCode: vendor.bankCode || "",
    accountNumber: vendor.accountNumber || "",
    accountName: vendor.accountName || "",
    hasDetails: !!(vendor.accountNumber && vendor.bankCode),
  });
}

export async function POST(request) {
  const vendor = await requireVendor();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { bankName, bankCode, accountNumber, accountName } = body;
  if (!bankCode || !accountNumber || !accountName) {
    return NextResponse.json({ error: "Bank code, account number and account name are required." }, { status: 400 });
  }
  if (!/^\d{10}$/.test(accountNumber.trim())) {
    return NextResponse.json({ error: "Account number must be exactly 10 digits." }, { status: 400 });
  }

  try {
    await convex().mutation(api.vendors.updateBankDetails, {
      id: vendor._id,
      bankName: bankName?.trim() || "",
      bankCode: bankCode.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      paystackRecipientCode: undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[vendor/bank] error:", err?.message || err);
    return NextResponse.json({ error: "Failed to save bank details." }, { status: 500 });
  }
}
