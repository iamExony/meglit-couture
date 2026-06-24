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
  const vendor = await convex().query(api.vendors.get, { id: session.id });
  if (!vendor || vendor.status !== "active") return null;
  return vendor;
}

export async function GET() {
  const vendor = await requireVendor();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // api.products.list already resolves storageIds to CDN URLs via withResolvedImages
  const all = await convex().query(api.products.list, {});
  const products = (all || []).filter((p) => p.vendorId === vendor._id);
  return NextResponse.json({ products });
}

export async function POST(request) {
  const vendor = await requireVendor();
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const {
    name, price, originalPrice, category, subcategory, description,
    images, sizes, colors, details, stock, slug: rawSlug, badge, sizeMeasurements,
  } = body;
  if (!name || !price || !category) {
    return NextResponse.json({ error: "Name, price and category are required." }, { status: 400 });
  }

  const slug = (rawSlug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

  function parseLines(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    if (typeof v === "string") return v.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    return [];
  }
  function parseCSV(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  }

  try {
    const id = await convex().mutation(api.products.create, {
      name,
      slug,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      subcategory: subcategory || undefined,
      description: description || "",
      images: parseLines(images),
      sizes: parseCSV(sizes),
      sizeMeasurements: sizeMeasurements && Object.keys(sizeMeasurements).length > 0 ? sizeMeasurements : undefined,
      colors: Array.isArray(colors) ? colors : [],
      details: parseLines(details),
      stock: Number(stock) || 0,
      badge: badge || undefined,
      vendorId: vendor._id,
      vendorStatus: "pending_review",
    });
    return NextResponse.json({ id });
  } catch (err) {
    console.error("[vendor/products POST] convex error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Failed to create product." }, { status: 500 });
  }
}
