import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_HOST: z.string().nonempty(),
    DATABASE_USER: z.string().nonempty(),
    DATABASE_PASSWORD: z.string().nonempty(),
    AUTH_SECRET: z.string().nonempty(),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
});
