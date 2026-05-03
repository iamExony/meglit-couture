import { NextResponse } from "next/server";
import { addOrder, listOrders } from "@/lib/store";

export async function POST(request) {
  try {
    const body = await request.json();
    const { reference, items, total, subtotal, shipping, customer, paymentStatus, status } = body;

    if (!reference || !items || !customer) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    const order = {
      id: `ORD-${Date.now()}`,
      reference,
      items,
      subtotal,
      total,
      shipping,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        note: customer.note,
        ...(customer.customerId ? { customerId: customer.customerId } : {}),
      },
      paymentReference: reference,
      paymentStatus: paymentStatus || "pending",
      status: status || "pending",
      createdAt: new Date().toISOString(),
    };

    const created = await addOrder(order);

    return NextResponse.json({ success: true, order: created });
  } catch (err) {
    if (err && err.code === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: err.message, code: "INSUFFICIENT_STOCK", details: err.details || [] },
        { status: 409 }
      );
    }
    console.error("[orders] create failed", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ orders: await listOrders() });
}
