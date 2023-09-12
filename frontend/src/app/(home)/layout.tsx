import ServerNav from "@/components/server-nav";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session) redirect("/auth/login");

  return (
    <div className="w-screen h-screen flex">
      <Toaster />
      <ServerNav />
      {children}
    </div>
  );
}
