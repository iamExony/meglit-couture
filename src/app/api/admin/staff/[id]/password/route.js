import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { setUserPassword, getUserById } from "@/lib/store";

export async function POST(request, { params }) {
  const { user, response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const target = await getUserById(id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const { password } = await request.json();
    const result = await setUserPassword(id, password, user);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
