import NextAuthSessionProvider from "@/components/session-provider";
import "./globals.css";
import { getServerAuthSession } from "@/lib/auth";
import TRPCProvider from "./_trpc/provider";
import { ThemeProvider } from "@/lib/next-themes";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <html lang="en">
      <body className="bg-background">
        <ThemeProvider attribute="class">
          <NextAuthSessionProvider session={session}>
            <TRPCProvider>{children}</TRPCProvider>
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
