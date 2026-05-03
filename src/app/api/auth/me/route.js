import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";
import { verifyCustomerToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  const session = await verifyCustomerToken(token);
  if (!session) {
    return NextResponse.json({ customer: null });
  }
  try {
    const customer = await convex().query(api.customers.get, { id: session.id });
    if (!customer) return NextResponse.json({ customer: null });
    return NextResponse.json({
      customer: {
        id: customer._id,
        email: customer.email,
        name: customer.name,
        firstName: customer.firstName,
        lastName: customer.lastName,
        picture: customer.picture,
        phone: customer.phone,
      },
    });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
