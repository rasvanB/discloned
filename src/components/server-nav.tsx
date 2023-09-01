import { serverClient } from "@/app/_trpc/serverClient";
import Separator from "./separator";
import { DirectMessagesButton } from "./server-button";
import CreateGuildDialog from "./create-guild-dialog";
import ServerList from "./server-list";

export default async function ServerNav() {
  const servers = await serverClient.getGuilds();
  return (
    <nav className="h-screen overflow-y-auto overflow-x-clip no-scrollbar w-[75px] bg-card border-r-[1px] flex flex-col items-center py-2 flex-shrink-0">
      <div className="w-full flex flex-col items-center">
        <DirectMessagesButton />
        <Separator />
        <ServerList initialData={servers} />
        <CreateGuildDialog />
      </div>
    </nav>
  );
}
