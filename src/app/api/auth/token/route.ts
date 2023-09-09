import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/env.mjs";

const secret = env.AUTH_SECRET;

export async function GET(req: NextRequest) {
  const sessionToken = await getToken({ req, secret, raw: true });
  if (!sessionToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  console.log("sessionToken", sessionToken);

  return NextResponse.json({
    sessionToken,
  });
}
