import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../../convex/_generated/api";
import { sendVendorApprovalEmail, sendVendorRejectionEmail, sendVendorRemovedEmail } from "@/lib/mail";

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://meglitcouture.com";

export async function PATCH(request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { action } = body;

  try {
    // Fetch vendor before mutation so we have email + storeName for notifications
    const vendor = await convex().query(api.vendors.get, { id });

    if (action === "approve") {
      await convex().mutation(api.vendors.approve, { id, approvedBy: user.username });
      if (vendor?.email) {
        sendVendorApprovalEmail({
          to: vendor.email,
          storeName: vendor.storeName,
          loginUrl: `${SITE_URL}/vendor/login`,
        }).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }
    if (action === "reject") {
      await convex().mutation(api.vendors.reject, { id });
      if (vendor?.email) {
        sendVendorRejectionEmail({
          to: vendor.email,
          storeName: vendor.storeName,
        }).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }
    if (action === "suspend") {
      await convex().mutation(api.vendors.suspend, { id });
      return NextResponse.json({ ok: true });
    }
    if (action === "remove") {
      await convex().mutation(api.vendors.remove, { id });
      if (vendor?.email) {
        sendVendorRemovedEmail({
          to: vendor.email,
          storeName: vendor.storeName,
        }).catch(() => {});
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error(`[admin/vendors/${id}] ${action} error:`, err?.message || err);
    return NextResponse.json({ error: "Action failed. Please try again." }, { status: 500 });
  }
}
