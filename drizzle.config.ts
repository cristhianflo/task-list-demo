// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL!;

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: dbUrl,
  },
});
