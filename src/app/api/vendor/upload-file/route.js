import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyVendorToken, VENDOR_COOKIE } from "@/lib/vendorAuth";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";

export async function POST(request) {
  try {
    const jar = await cookies();
    const token = jar.get(VENDOR_COOKIE)?.value;
    const session = await verifyVendorToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await convex().query(api.vendors.get, { id: session.id });
    if (!vendor || vendor.status !== "active") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    // Get a presigned upload URL from Convex
    const uploadUrl = await convex().mutation(api.products.generateUploadUrl, {});

    // Upload the file from the server to Convex storage
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      console.error("[vendor/upload-file] Convex upload failed:", uploadRes.status, text);
      return NextResponse.json({ error: "Upload to storage failed." }, { status: 500 });
    }

    const { storageId } = await uploadRes.json();
    return NextResponse.json({ storageId });
  } catch (err) {
    console.error("[vendor/upload-file] error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Upload failed." }, { status: 500 });
  }
}
