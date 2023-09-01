import { serverClient } from "@/app/_trpc/serverClient";
import UserInfo from "./user-info";
import ChannelList from "./channel-list";

export const BaseSideBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col w-[250px] h-full bg-card border-r-[1px] border-border flex-shrink-0 relative">
      {children}
      <UserInfo />
    </div>
  );
};

export const ServerSideBar = async ({ serverId }: { serverId: string }) => {
  const serverInfo = await serverClient.getGuildById(serverId);
  if (!serverInfo) return null;

  return (
    <BaseSideBar>
      <div className="h-12 p-3 border-b-[1px] border-border/60 flex items-center justify-between">
        <p className="text-[16px] font-medium">{serverInfo.name}</p>
      </div>
      <div>
        {serverInfo.channels && (
          <ChannelList initialData={serverInfo.channels} guildId={serverId} />
        )}
      </div>
    </BaseSideBar>
  );
};

export const DMsSideBar = () => {
  return (
    <BaseSideBar>
      <div className="h-12 p-3 border-b-[1px] border-border/60 flex items-center justify-between">
        <p className="text-[16px] font-medium">Direct Messages</p>
      </div>
    </BaseSideBar>
  );
};
