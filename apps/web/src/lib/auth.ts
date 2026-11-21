import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// jose (not a bigger auth framework) because middleware runs on Next.js's
// "Edge" runtime, and jose is one of the few JWT libraries that works there.
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-secret-change-me"
);

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export type SessionPayload = {
  userId: number;
  email: string;
  role: "student" | "guardian";
};

// Everything the app needs to know about who's logged in, signed into one
// token and stored in an httpOnly cookie — the server trusts the signature,
// never anything the browser could edit.
export function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function readSessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionPayload;
  } catch {
    // Expired, tampered with, or signed with an old secret — all the same to us: not logged in.
    return null;
  }
}
