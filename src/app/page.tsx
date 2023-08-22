import { db } from "@/db";
import { users } from "@/db/schema";

export default async function Home() {
  const test = await db.select().from(users).get();
  return <main></main>;
}
