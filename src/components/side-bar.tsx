import { serverClient } from "@/app/_trpc/serverClient";
import UserInfo from "./user-info";
import ChannelList from "./channel-list";
import { ReactNode } from "react";
import MemberList from "@/components/member-list";
import ServerSettings from "@/components/server-settings";

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
  if (!serverInfo) return null;

  const user = serverInfo.members[0];
  if (!user) return null;

  const serverChannels = serverInfo.channels.map((channel) => {
    return {
      ...channel,
      createdAt: channel.createdAt.toString(),
    };
  });

  const serverMembers = serverInfo.members.map((member) => {
    return {
      ...member,
      joinedAt: member.joinedAt.toString(),
    };
  });

  return (
    <BaseSideBar>
      <div className="h-12 p-3 border-b-[1px] border-border/60 flex items-center justify-between">
        <p className="text-[16px] font-medium">{serverInfo.name}</p>
        <ServerSettings userRole={user.role} />
      </div>
      {serverInfo.channels && (
        <ChannelList
          initialData={serverChannels}
          guildId={serverId}
          userRole={user.role}
        />
      )}
      <MemberList initialData={serverMembers} guildId={serverId} />
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
