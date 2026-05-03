import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "./auth";
import { getUserById, ensureBootstrapAdmin } from "./store";

export async function getCurrentUser() {
  await ensureBootstrapAdmin();
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const user = await getUserById(session.id);
  if (!user || !user.active) return null;
  // strip credentials
  const { passwordHash, salt, ...safe } = user;
  void passwordHash; void salt;
  return { ...safe, id: safe._id };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}

export async function requireAdmin() {
  const { user, response } = await requireUser();
  if (response) return { user: null, response };
  if (user.role !== "admin") {
    return { user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, response: null };
}
