import { drizzle } from "drizzle-orm/planetscale-serverless";
import * as schema from "./schema";
import { env } from "@/env.mjs";

import { connect } from "@planetscale/database";

const client = connect({
  host: env.DATABASE_HOST,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
});

export const db = drizzle(client, { schema, logger: true });
