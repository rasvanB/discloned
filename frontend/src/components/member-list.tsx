"use client";

import { trpc } from "@/app/_trpc/client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const MemberList = ({ guildId }: { guildId: string }) => {
  const { data, isLoading } = trpc.getMembersForGuild.useQuery(guildId, {
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // TODO: ADD LOADING STATE SKELTON
  if (isLoading) {
    return <div>loading...</div>;
  }

  if (!data) return null;

  return (
    <div className={"px-4"}>
      <h4 className="text-sm font-semibold leading-tight">MEMBERS</h4>
      <div>
        {data.map((member) => {
          return (
            <div key={member.id} className="flex items-center mt-2 gap-2">
              {/*TODO: ADD DEFAULT USER IMAGE / MAYBE TO DB SCHEMA AS DEFAULT VALUE THO */}
              <Avatar className={"w-[30px] h-[30px]"}>
                <AvatarImage
                  src={member.user.image || "no_user_image"}
                  referrerPolicy={"no-referrer"}
                />
              </Avatar>
              <span className={"font-regular truncate flex-grow-0"}>
                {member.user.name}
              </span>
              <span
                className={"ml-auto text-xs text-muted-foreground flex-grow-0"}
              >
                {member.role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberList;
