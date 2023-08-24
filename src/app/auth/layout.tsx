import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (session) {
    redirect("/");
  }
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="w-[300px]">{children}</div>
    </main>
  );
}
