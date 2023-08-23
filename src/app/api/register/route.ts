import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  const result = registerSchema.safeParse(await request.json());

  if (!result.success) {
    return {
      status: 400,
      body: result.error.message,
    };
  }
  const { name, email, password } = result.data;

  const hashedPassword = await bcrypt.hash(password, 12);

  await db
    .insert(users)
    .values({
      name,
      email,
      hashedPassword,
    })
    .execute();

  const dbResult = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.email, email))
    .execute();

  const user = dbResult[0];

  if (!user) {
    return {
      status: 500,
      body: "Something went wrong",
    };
  }

  return NextResponse.json(user);
}
