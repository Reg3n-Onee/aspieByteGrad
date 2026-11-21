import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSessionToken } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: session });
}
