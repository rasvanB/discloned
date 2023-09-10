"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  LogOutIcon,
  LucideIcon,
  Trash,
  UserPlus,
} from "lucide-react";
import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import DeleteServerModal from "@/components/modals/delete-server-modal";
import { useModal } from "@/hooks/use-modal";
import LeaveServerModal from "@/components/modals/leave-server-modal";
import ServerInviteModal from "@/components/modals/server-invite-modal";

const DestructiveMenuItem = ({
  onSelect,
  Icon,
  text,
}: {
  onSelect: () => void;
  text: string;
  Icon: LucideIcon;
}) => {
  return (
    <DropdownMenuItem
      className={
        "text-destructive font-medium focus:text-destructive focus:bg-destructive/20"
      }
      onSelect={onSelect}
    >
      <Icon size={14} className={"mr-2"} /> {text}
    </DropdownMenuItem>
  );
};

const ServerSettings = ({
  userRole,
  guildId,
}: {
  userRole: ProcedureOutputs["getMembersForGuild"][number]["role"];
  guildId: string;
}) => {
  const canEditServer = userRole === "owner" || userRole === "admin";

  const { onOpen } = useModal();

  const openConfirmModal = (
    type: "deleteServer" | "leaveServer" | "inviteMember",
  ) => {
    onOpen({
      type,
      state: { guildId },
    });
  };

  return (
    <>
      <LeaveServerModal />
      {canEditServer && (
        <>
          <DeleteServerModal />
          <ServerInviteModal />
        </>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={"icon"}>
            <ChevronDown size={20} className="text-accent-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => openConfirmModal("inviteMember")}>
              <UserPlus size={14} className={"mr-2"} />
              Invite People
            </DropdownMenuItem>
            {canEditServer && <DropdownMenuItem>Settings</DropdownMenuItem>}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DestructiveMenuItem
              Icon={LogOutIcon}
              text={"Leave Server"}
              onSelect={() => openConfirmModal("leaveServer")}
            />
            {canEditServer && (
              <>
                <DropdownMenuSeparator />
                <button className={"w-full"}>
                  <DestructiveMenuItem
                    Icon={Trash}
                    text={"Delete Server"}
                    onSelect={() => openConfirmModal("deleteServer")}
                  />
                </button>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ServerSettings;
