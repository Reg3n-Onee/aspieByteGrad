import { describe, it, expect } from "vitest";
import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const res = await POST();
    const setCookie = (res.headers.get("set-cookie") ?? "").toLowerCase();

    expect(res.status).toBe(200);
    expect(setCookie).toContain("session=");
    // Deleting a cookie means sending it back already expired.
    expect(setCookie).toMatch(/max-age=0|expires=thu, 01 jan 1970/);
  });
});
