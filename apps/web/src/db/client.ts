import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// A local file for now (dev.db, gitignored). Swapping to real Postgres later
// is a one-line change here plus a different `dialect` in drizzle.config.ts —
// the schema file and every query elsewhere in the app stay the same.
const sqlite = new Database(process.env.DATABASE_PATH ?? "./dev.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
