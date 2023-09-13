import { getServerAuthSession } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { encode } from "next-auth/jwt";
import { env } from "@/env.mjs";

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

export const useSessionToken = t.middleware(async (opts) => {
  try {
    const { user } = opts.ctx as {
      user: { id: string; email: string; image: string; name: string };
    };
    const sessionToken = await encode({
      token: {
        sub: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      secret: env.AUTH_SECRET,
      maxAge: 60 * 60 * 24 * 30,
    });
    return opts.next({
      ctx: {
        sessionToken,
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong encoding token",
      cause: error,
    });
  }
});

export const protectedProcedure = t.procedure.use(isAuth);
