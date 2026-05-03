import { NextResponse } from "next/server";
import { createSessionToken, ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE } from "@/lib/auth";
import { ensureBootstrapAdmin, getUserByUsername, verifyPassword, logActivity } from "@/lib/store";

export async function POST(request) {
  try {
    await ensureBootstrapAdmin();
    const { username, password } = await request.json();
    const user = await getUserByUsername(username);
    if (!user || !user.active || !verifyPassword(password, user.salt, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = await createSessionToken({ id: user._id, username: user.username, role: user.role });
    logActivity({ actor: user.username, action: "auth.login" });
    const res = NextResponse.json({
      success: true,
      user: { id: user._id, username: user.username, name: user.name, role: user.role },
    });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
