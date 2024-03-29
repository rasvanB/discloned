import * as dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  driver: "mysql2",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  out: "./drizzle/",
  verbose: true,
  strict: true,
} satisfies Config;
