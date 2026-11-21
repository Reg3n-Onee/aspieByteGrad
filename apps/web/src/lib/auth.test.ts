import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  readSessionToken,
} from "./auth";

describe("password hashing", () => {
  it("verifies a password against its own hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("never stores the password as plain text", async () => {
    const hash = await hashPassword("my-secret");
    expect(hash).not.toBe("my-secret");
  });
});

describe("session tokens", () => {
  it("reads back the same payload it was given", async () => {
    const token = await createSessionToken({
      userId: 1,
      email: "ada@example.com",
      role: "student",
    });

    const payload = await readSessionToken(token);

    expect(payload?.userId).toBe(1);
    expect(payload?.email).toBe("ada@example.com");
    expect(payload?.role).toBe("student");
  });

  it("rejects a token that was edited after it was signed", async () => {
    const token = await createSessionToken({
      userId: 1,
      email: "ada@example.com",
      role: "student",
    });
    const tampered = token.slice(0, -2) + "xx"; // flip the last two characters

    expect(await readSessionToken(tampered)).toBeNull();
  });

  it("rejects a string that isn't a token at all", async () => {
    expect(await readSessionToken("not-a-real-token")).toBeNull();
  });
});
