import { serverClient } from "@/app/_trpc/serverClient";
import UserInfo from "./user-info";
import ChannelList from "./channel-list";
import { ReactNode } from "react";
import MemberList from "@/components/member-list";
import ServerSettings from "@/components/server-settings";
import { redirect } from "next/navigation";

export const revalidate = 3600;

export const BaseSideBar = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col w-[250px] h-full bg-card border-r-[1px] border-border flex-shrink-0 relative">
      {children}
      <UserInfo />
    </div>
  );
};

export const ServerSideBar = async ({ serverId }: { serverId: string }) => {
  const serverInfo = await serverClient.getGuildById(serverId);

  if (!serverInfo) redirect("/server/me");

  const user = serverInfo.members[0];
  if (!user) return null;

  const serverChannels = serverInfo.channels.map((channel) => {
    return {
      ...channel,
      createdAt: channel.createdAt.toString(),
    };
  });

  return (
    <BaseSideBar>
      <div className="h-12 p-3 border-b-[1px] border-border/60 flex items-center justify-between">
        <p className="text-[16px] font-medium truncate">{serverInfo.name}</p>
        <ServerSettings userRole={user.role} guildId={serverId} />
      </div>
      {serverInfo.channels && (
        <ChannelList
          initialData={serverChannels}
          guildId={serverId}
          userRole={user.role}
        />
      )}
      <MemberList guildId={serverId} userRole={user.role} />
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
