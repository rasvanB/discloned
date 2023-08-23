import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_HOST: z.string().nonempty(),
    DATABASE_USERNAME: z.string().nonempty(),
    DATABASE_PASSWORD: z.string().nonempty(),
    AUTH_SECRET: z.string().nonempty(),
  },
  client: {},
  runtimeEnv: {
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
});
