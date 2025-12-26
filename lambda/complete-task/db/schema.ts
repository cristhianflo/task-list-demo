import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

export const TASK_STATUS = ["TODO", "PENDING", "DONE"] as const;

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(uuid())`)
    .$defaultFn(() => crypto.randomUUID()),
  cognitoSub: varchar("cognito_sub", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`(uuid())`)
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1024 }),
  status: varchar("status", { length: 20, enum: TASK_STATUS })
    .notNull()
    .default("TODO"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  completedAt: timestamp("completed_at"),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));
