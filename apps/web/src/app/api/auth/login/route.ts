import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyPassword, createSessionToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session-cookie";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const user = db.select().from(users).where(eq(users.email, email)).get();

  // Same error whether the email doesn't exist or the password is wrong —
  // on purpose, so this endpoint can't be used to find out who has an account.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Email or password is incorrect" },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role as "student" | "guardian",
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
    },
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
