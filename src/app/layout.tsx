import NextAuthSessionProvider from "@/components/session-provider";
import "./globals.css";
import { getServerAuthSession } from "@/lib/auth";
import TRPCProvider from "./_trpc/provider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <html lang="en">
      <body className="dark bg-background">
        <NextAuthSessionProvider session={session}>
          <TRPCProvider>{children}</TRPCProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
