import NextAuthSessionProvider from "@/components/session-provider";
import "./globals.css";
import { getServerAuthSession } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <html lang="en" className="dark bg-background">
      <body>
        <NextAuthSessionProvider session={session}>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
