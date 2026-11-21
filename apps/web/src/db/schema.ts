import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// One table instead of the old project's scattered "user" / "guardianPortal" tables.
// Guardians are just users with role "guardian" — simpler to query, simpler to protect.
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["student", "guardian"] })
    .notNull()
    .default("student"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Types Drizzle derives from the table above, so the rest of the app
// never writes out the shape of a "user" by hand.
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
