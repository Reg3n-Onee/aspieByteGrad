import { db } from "@/db/client";
import { users } from "@/db/schema";

// Call this between tests that touch the database, so one test's data
// (e.g. an email it signed up with) never leaks into the next test.
export function resetDb() {
  db.delete(users).run();
}
