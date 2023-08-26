import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerAuthSession();
  if (!session) redirect("/auth/login");
  redirect("/home");

  return (
    <main className="flex flex-col w-screen h-screen">
      <div>SERVER: {JSON.stringify(session)}</div>
    </main>
  );
}
