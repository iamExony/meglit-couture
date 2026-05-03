import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { listProducts, createProduct, logActivity } from "@/lib/store";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;
  const products = await listProducts();
  return NextResponse.json({ products });
}

export async function POST(request) {
  const { user, response } = await requireUser();
  if (response) return response;
  try {
    const body = await request.json();
    const product = await createProduct(body);
    logActivity({ actor: user.username, action: "product.create", target: product.name, meta: { id: product.id } });
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 400 });
  }
}
