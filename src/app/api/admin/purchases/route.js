import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { listPurchases, addPurchase, logActivity } from "@/lib/store";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;
  return NextResponse.json({ purchases: await listPurchases() });
}

export async function POST(request) {
  const { user, response } = await requireUser();
  if (response) return response;
  try {
    const body = await request.json();
    const result = await addPurchase(body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    logActivity({ actor: user.username, action: "purchase.create", target: result.purchase.productName, meta: { id: result.purchase.id, qty: result.purchase.quantity } });
    return NextResponse.json({ purchase: result.purchase }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
