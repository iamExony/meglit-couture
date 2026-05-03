import { NextResponse } from "next/server";
import { requireUser, requireAdmin } from "@/lib/session";
import { getProduct, updateProduct, deleteProduct, logActivity } from "@/lib/store";

export async function GET(_request, { params }) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  try {
    const body = await request.json();
    const product = await updateProduct(id, body);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    logActivity({ actor: user.username, action: "product.update", target: product.name, meta: { id: product.id } });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const { user, response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const product = await getProduct(id);
  const ok = await deleteProduct(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  logActivity({ actor: user.username, action: "product.delete", target: product?.name || `#${id}` });
  return NextResponse.json({ success: true });
}
