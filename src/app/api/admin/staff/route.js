import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { listUsers, createUser } from "@/lib/store";

export async function GET() {
  const { user, response } = await requireAdmin();
  if (response) return response;
  void user;
  return NextResponse.json({ users: await listUsers() });
}

export async function POST(request) {
  const { user, response } = await requireAdmin();
  if (response) return response;
  try {
    const body = await request.json();
    const result = await createUser(body, user);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
