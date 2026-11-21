import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "@/test/db-utils";
import { POST } from "./route";

function signupRequest(body: unknown) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => resetDb());

  it("creates an account and sets a session cookie", async () => {
    const res = await POST(
      signupRequest({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        password: "password123",
        role: "student",
      })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("session=");

    const data = await res.json();
    expect(data.user.email).toBe("ada@example.com");
    expect(data.user.id).toBeTypeOf("number");
  });

  it("rejects a second signup with the same email", async () => {
    const firstSignup = {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "password123",
      role: "student" as const,
    };

    await POST(signupRequest(firstSignup));
    const res = await POST(signupRequest({ ...firstSignup, firstName: "Someone Else" }));

    expect(res.status).toBe(409);
  });

  it("rejects a request missing required fields", async () => {
    const res = await POST(signupRequest({ firstName: "Ada" }));
    expect(res.status).toBe(400);
  });
});
