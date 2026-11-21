import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema } from "./validation";

describe("signupSchema", () => {
  const validSignup = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    password: "password123",
    role: "student" as const,
  };

  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({ ...validSignup, password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects an email that isn't a real email", () => {
    const result = signupSchema.safeParse({ ...validSignup, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing first name", () => {
    const result = signupSchema.safeParse({ ...validSignup, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("defaults role to student when none is given", () => {
    const result = signupSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "password123",
      // role intentionally left out
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe("student");
  });
});

describe("loginSchema", () => {
  it("accepts a valid login", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "ada@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});
