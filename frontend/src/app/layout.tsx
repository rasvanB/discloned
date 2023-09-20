import NextAuthSessionProvider from "@/components/session-provider";
import "./globals.css";
import { getServerAuthSession } from "@/lib/auth";
import TRPCProvider from "./_trpc/provider";
import { ThemeProvider } from "@/lib/next-themes";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <html lang="en">
      <body
        className={
          inter.className +
          " bg-background selection:bg-primary overflow-hidden"
        }
      >
        <ThemeProvider attribute="class">
          <NextAuthSessionProvider session={session}>
            <TRPCProvider>{children}</TRPCProvider>
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
