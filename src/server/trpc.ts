import { getServerAuthSession } from "@/lib/auth";
import { TRPCError, initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuth = t.middleware(async (opts) => {
  const session = await getServerAuthSession();

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to do this",
    });
  }

  return opts.next({
    ctx: {
      user: session.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuth);
