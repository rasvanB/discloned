"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useModal } from "@/hooks/use-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";
import Image from "next/image";
import { DEFAULT_USER_IMAGE_SRC } from "@/utils/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const roles = ["admin", "member"] as const;
type Role = (typeof roles)[number];

const RoleSelect = ({
  onChange,
  value,
  disabled,
}: {
  disabled?: boolean;
  value: Role;
  onChange: (role: Role) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[100px] px-2 h-8 justify-between text-center"
        >
          <span className={"w-full"}>{value}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <Command>
          <CommandGroup>
            {roles.map((role) => (
              <CommandItem
                key={role}
                onSelect={(currentValue) => {
                  onChange(currentValue as Role);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === role ? "opacity-100" : "opacity-0",
                  )}
                />
                {role}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const ManageMembersModal = () => {
  const { modal, isOpen, onClose } = useModal();
  const isModalOpen = modal.type === "manageMembers" && isOpen;

  const guildId = modal.state?.guildId || "none";

  const { data: members, refetch: refetchMembers } =
    trpc.getMembersForGuild.useQuery(guildId, {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    });

  const { data: currentMember } = trpc.getCurrentServerMember.useQuery(
    guildId,
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const kickMemberMutation = trpc.kickMember.useMutation({
    onSuccess: async () => {
      await refetchMembers();
    },
  });

  const updateMemberRoleMutation = trpc.changeMemberRole.useMutation({
    onSuccess: async () => {
      await refetchMembers();
    },
  });

  if (modal.type !== "manageMembers") return null;
  if (!members || !currentMember) return null;

  const canManageMembers = currentMember.role === "owner";
  const canKickMembers =
    currentMember.role === "owner" || currentMember.role === "admin";

  const membersExcludingCurrent = members.filter(
    (member) => member.id !== currentMember.id,
  );

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className={"text-left"}>
          <DialogTitle>Manage members</DialogTitle>
        </DialogHeader>
        <div className={"flex flex-col gap-2"}>
          {membersExcludingCurrent.length === 0 && (
            <div className={"text-muted-foreground"}>
              No members to manage. Invite some!
            </div>
          )}
          {membersExcludingCurrent.map((member) => (
            <div key={member.id} className={"flex gap-2 items-center w-full"}>
              <Image
                src={member.user.image || DEFAULT_USER_IMAGE_SRC}
                alt={"user_avatar"}
                width={30}
                height={30}
                className={"rounded"}
              />
              <div className={"leading-tight"}>
                <div>{member.user.name}</div>
                <div className={"text-xs text-muted-foreground"}>
                  {member.user.email}
                </div>
              </div>
              <div className={"ml-auto flex items-center gap-2"}>
                <RoleSelect
                  value={member.role as Role}
                  onChange={(role) => {
                    updateMemberRoleMutation.mutate({
                      guildId,
                      memberId: member.id,
                      role,
                    });
                  }}
                  disabled={
                    updateMemberRoleMutation.isLoading || !canManageMembers
                  }
                />
                {canKickMembers && member.role !== "owner" && (
                  <Button
                    variant={"destructive"}
                    size={"sm"}
                    className={"h-7 px-2"}
                    onClick={() => {
                      kickMemberMutation.mutate({
                        guildId,
                        memberId: member.id,
                      });
                    }}
                    disabled={kickMemberMutation.isLoading}
                  >
                    {kickMemberMutation.isLoading ? (
                      <Loader2 size={"16"} />
                    ) : (
                      "Kick"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageMembersModal;
