import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { readSessionToken } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import LogoutButton from "./LogoutButton";

// The middleware already keeps logged-out visitors out of this page.
// This still re-checks the session itself — a server component should
// never assume another file ran first, and the extra lookup here also
// gets us the user's current name straight from the database.
export default async function DashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;

  const user = session
    ? db.select().from(users).where(eq(users.id, session.userId)).get()
    : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">
        Welcome, {user?.firstName ?? "there"}
      </h1>
      <p className="text-gray-600">
        You&apos;re signed in as a {user?.role}. This page only exists
        because the session cookie checked out.
      </p>
      <LogoutButton />
    </main>
  );
}
