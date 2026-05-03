import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { unreadCountForUser } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: { id: user.id, username: user.username, name: user.name, role: user.role, email: user.email },
    unread: unreadCountForUser(user.id),
  });
}
