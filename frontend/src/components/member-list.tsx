"use client";

import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import { DEFAULT_USER_IMAGE_SRC } from "@/utils/constants";

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
              <Image
                width={30}
                height={30}
                alt={"user_avatar"}
                className={"rounded-full w-[30px] h-[30px]"}
                src={member.user.image || DEFAULT_USER_IMAGE_SRC}
                referrerPolicy={"no-referrer"}
              />
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
