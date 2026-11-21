// Kept in one place so the login route, the signup route, and the
// middleware that checks for a session all agree on the cookie's name and rules.
export const SESSION_COOKIE = "session";

export const sessionCookieOptions = {
  httpOnly: true, // JavaScript in the browser can't read this — blocks a whole class of XSS token theft
  secure: process.env.NODE_ENV === "production", // HTTPS-only once deployed; localhost has no HTTPS
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days, matches the JWT's own expiry
};
