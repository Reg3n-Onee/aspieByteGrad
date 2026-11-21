import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword, createSessionToken } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session-cookie";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, password, role } = parsed.data;

  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({ firstName, lastName, email, passwordHash, role })
    .returning();

  const token = await createSessionToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role as "student" | "guardian",
  });

  const response = NextResponse.json({
    user: {
      id: newUser.id,
      firstName: newUser.firstName,
      email: newUser.email,
      role: newUser.role,
    },
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
