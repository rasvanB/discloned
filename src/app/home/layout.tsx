import ServerNav from "@/components/server-nav";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen flex">
      <ServerNav />
      <div>{children}</div>
    </div>
  );
}
