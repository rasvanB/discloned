import ServerNav from "@/components/server-nav";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

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
      <Suspense fallback={<div>loading the server nav</div>}>
        <ServerNav />
      </Suspense>
      <div>{children}</div>
    </div>
  );
}
