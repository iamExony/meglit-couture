import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { listThreadsForUser, listThread, sendMessage, markThreadRead, getUserById } from "@/lib/store";

export async function GET(request) {
  const { user, response } = await requireUser();
  if (response) return response;
  const url = new URL(request.url);
  const withId = url.searchParams.get("with");
  if (!withId) {
    return NextResponse.json({ threads: await listThreadsForUser(user.id) });
  }
  const partner = await getUserById(withId);
  if (!partner) return NextResponse.json({ error: "User not found" }, { status: 404 });
  // Staff can only message admins; admins can message anyone
  if (user.role === "staff" && partner.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await markThreadRead(user.id, partner._id);
  return NextResponse.json({
    partner: { id: partner._id, username: partner.username, name: partner.name, role: partner.role },
    messages: await listThread(user.id, partner._id),
  });
}

export async function POST(request) {
  const { user, response } = await requireUser();
  if (response) return response;
  try {
    const { toId, body } = await request.json();
    const partner = await getUserById(toId);
    if (!partner) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    if (user.role === "staff" && partner.role !== "admin") {
      return NextResponse.json({ error: "Staff can only message admins" }, { status: 403 });
    }
    const result = await sendMessage({ fromId: user.id, toId: partner._id, body });
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ message: result.message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
