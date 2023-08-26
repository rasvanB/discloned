import { serverClient } from "@/app/_trpc/serverClient";
import Separator from "./separator";
import ServerButton from "./server-button";
import CreateGuildDialog from "./create-guild-dialog";

export default async function ServerNav() {
  const servers = await serverClient.getGuilds();
  return (
    <nav className="h-screen w-[75px] bg-card border-r-[1px] flex flex-col items-center py-2">
      <div className="w-full flex flex-col items-center">
        <ServerButton />
        <Separator />
        {servers &&
          servers.map((server) => {
            return <div key={server.id}>{server.name}</div>;
          })}
        <CreateGuildDialog />
      </div>
    </nav>
  );
}
