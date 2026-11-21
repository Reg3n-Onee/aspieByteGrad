import { beforeAll } from "vitest";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "@/db/client";

// Builds the "users" table inside the in-memory test database, using the
// exact same migration file that would set up a real database. This runs
// once before any test in a file, so every test starts with real tables
// but zero rows.
beforeAll(() => {
  migrate(db, { migrationsFolder: "./drizzle" });
});
