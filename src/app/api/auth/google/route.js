import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { convex } from "@/lib/convexServer";
import { api } from "../../../../../convex/_generated/api";
import { createCustomerToken, CUSTOMER_COOKIE, CUSTOMER_COOKIE_MAX_AGE } from "@/lib/customerAuth";
import { logActivity } from "@/lib/store";

// Receives a Google ID token (JWT credential) from the client (Google
// Identity Services / GIS button). Verifies it server-side, upserts the
// customer in Convex, and sets an HMAC-signed session cookie.

export async function POST(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google sign-in not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const credential = body?.credential;
  if (!credential || typeof credential !== "string") {
    return NextResponse.json({ error: "credential is required" }, { status: 400 });
  }

  try {
    const oauth = new OAuth2Client(clientId);
    const ticket = await oauth.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const customer = await convex().mutation(api.customers.upsertFromGoogle, {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || undefined,
      firstName: payload.given_name || undefined,
      lastName: payload.family_name || undefined,
      picture: payload.picture || undefined,
      emailVerified: !!payload.email_verified,
    });

    const token = await createCustomerToken({ id: customer._id, email: customer.email });

    logActivity({
      actor: "customer",
      action: "auth.signin",
      target: customer.email,
      meta: { id: customer._id },
    });

    const res = NextResponse.json({
      ok: true,
      customer: {
        id: customer._id,
        email: customer.email,
        name: customer.name,
        firstName: customer.firstName,
        lastName: customer.lastName,
        picture: customer.picture,
      },
    });
    res.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CUSTOMER_COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[auth/google] verify failed", err);
    return NextResponse.json({ error: "Sign-in failed" }, { status: 401 });
  }
}
