import { Card, CardContent } from "@/components/ui/card";
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
      <div className="w-[350px]">
        <Card>
          <CardContent className="pt-4">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
