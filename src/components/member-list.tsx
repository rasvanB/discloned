"use client";

import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import { trpc } from "@/app/_trpc/client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const MemberList = ({
  initialData,
  guildId,
}: {
  initialData: NonNullable<ProcedureOutputs["getGuildById"]>["members"];
  guildId: string;
}) => {
  const { data, isLoading } = trpc.getMembersForGuild.useQuery(guildId, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (isLoading) {
    return <div>loading...</div>;
  }

  if (!data) {
    return <div>no data</div>;
  }

  return (
    <div className={"px-4"}>
      <h4 className="text-sm font-semibold leading-tight">MEMBERS</h4>
      <div>
        {data.map((member) => {
          return (
            <div key={member.id} className="flex items-center mt-2 gap-2">
              <Avatar className={"w-[30px] h-[30px]"}>
                <AvatarImage src={member.user.image || "no_user_image"} />
              </Avatar>
              <span className={"font-regular"}>{member.user.name}</span>
              <span className={"ml-auto text-xs text-muted-foreground"}>
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
