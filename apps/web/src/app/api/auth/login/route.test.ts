import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "@/test/db-utils";
import { POST as signup } from "../signup/route";
import { POST as login } from "./route";

function request(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    resetDb();
    // Every login test needs an existing account to log into.
    await signup(
      request("/api/auth/signup", {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        password: "password123",
        role: "student",
      })
    );
  });

  it("logs in with the correct password", async () => {
    const res = await login(
      request("/api/auth/login", { email: "ada@example.com", password: "password123" })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("session=");
  });

  it("rejects the wrong password", async () => {
    const res = await login(
      request("/api/auth/login", { email: "ada@example.com", password: "wrong-password" })
    );
    expect(res.status).toBe(401);
  });

  // This is the specific security property mentioned in comment.txt: the old
  // app's error messages let someone check which emails have accounts.
  // This test fails if that bug ever comes back.
  it("gives the exact same error for a wrong password and an unknown email", async () => {
    const wrongPassword = await login(
      request("/api/auth/login", { email: "ada@example.com", password: "wrong-password" })
    );
    const unknownEmail = await login(
      request("/api/auth/login", { email: "nobody@example.com", password: "password123" })
    );

    const [a, b] = await Promise.all([wrongPassword.json(), unknownEmail.json()]);

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(a.error).toBe(b.error);
  });
});
