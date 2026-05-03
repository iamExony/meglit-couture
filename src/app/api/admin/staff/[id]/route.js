import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { updateUser, deleteUser, getUserById } from "@/lib/store";

export async function PATCH(request, { params }) {
  const { user, response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const target = await getUserById(id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const body = await request.json();
    // Don't let admin demote/deactivate themselves accidentally
    if (target._id === user.id && (body.role === "staff" || body.active === false)) {
      return NextResponse.json({ error: "You cannot demote or deactivate yourself" }, { status: 400 });
    }
    const result = await updateUser(id, body, user);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const { user, response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const target = await getUserById(id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target._id === user.id) return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
  const result = await deleteUser(id, user);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
