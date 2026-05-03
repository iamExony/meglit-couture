import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { listUsers } from "@/lib/store";

// Returns the list of users the current user can message.
// Staff -> all admins. Admin -> all other users.
export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  const users = await listUsers();
  let contacts;
  if (user.role === "staff") {
    contacts = users.filter((u) => u.role === "admin" && u.active);
  } else {
    contacts = users.filter((u) => u.id !== user.id);
  }
  return NextResponse.json({
    contacts: contacts.map((u) => ({ id: u.id, username: u.username, name: u.name, role: u.role, active: u.active })),
  });
}
