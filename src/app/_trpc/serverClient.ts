import { httpBatchLink } from "@trpc/client";
import { appRouter, type AppRouter } from "@/server";
import getBaseUrl from "@/utils/getBaseUrl";
import { inferRouterOutputs } from "@trpc/server";

export const serverClient = appRouter.createCaller({
  links: [httpBatchLink({ url: `${getBaseUrl()}/api/trpc` })],
});

export type ProcedureOutputs = inferRouterOutputs<AppRouter>;
