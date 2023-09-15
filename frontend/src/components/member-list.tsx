"use client";

import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import { DEFAULT_USER_IMAGE_SRC } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";
import TooltipWrapper from "@/components/tooltip";
import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import ManageMembersModal from "@/components/modals/manage-members-modal";
import { useModal } from "@/hooks/use-modal";

const MemberList = ({
  guildId,
  userRole,
}: {
  guildId: string;
  userRole: NonNullable<
    ProcedureOutputs["getGuildById"]
  >["members"][number]["role"];
}) => {
  const { data, isLoading } = trpc.getMembersForGuild.useQuery(guildId, {
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { onOpen } = useModal();

  const openManageMembersModal = () => {
    onOpen({
      type: "manageMembers",
      state: {
        guildId,
      },
    });
  };

  // TODO: add loading state skeleton
  if (isLoading) {
    return <div>loading...</div>;
  }

  if (!data) return null;

  const canManageMembers = userRole === "admin" || userRole === "owner";

  return (
    <>
      <ManageMembersModal />
      <div className={"flex items-center w-full px-2 pl-4"}>
        <h4 className="text-sm font-semibold leading-tight w-full">MEMBERS</h4>
        {canManageMembers && (
          <TooltipWrapper content={"Manage Members"} side={"top"}>
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={openManageMembersModal}
            >
              <UserCog size={18} />
            </Button>
          </TooltipWrapper>
        )}
      </div>
      <div className={"px-4"}>
        {data.map((member) => {
          return (
            <div key={member.id} className="flex items-center mt-2 gap-2">
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
    </>
  );
};

export default MemberList;
