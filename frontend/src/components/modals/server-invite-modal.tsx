"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/use-modal";
import { trpc } from "@/app/_trpc/client";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { getQueryKey } from "@trpc/react-query";
import { queryClient } from "@/app/_trpc/provider";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import TooltipWrapper from "@/components/tooltip";
import getBaseUrl from "@/utils/getBaseUrl";

const ServerInviteModal = () => {
  const { modal, isOpen, onClose } = useModal();

  const isModalOpen = modal.type === "inviteMember" && isOpen;

  const { data: invite, isLoading: inviteLoading } = trpc.getInvite.useQuery(
    modal.state?.guildId || "none",
  );

  const { mutate, isLoading: createInviteLoading } =
    trpc.createInvite.useMutation({
      onSuccess: async () => {
        if (modal.type !== "inviteMember") return;

        const getInviteQueryKey = getQueryKey(
          trpc.getInvite,
          modal.state.guildId,
          "query",
        );

        await queryClient.invalidateQueries(getInviteQueryKey);
      },
    });

  useEffect(() => {
    if (inviteLoading) return;
    if (!invite && modal.type === "inviteMember") {
      mutate(modal.state.guildId);
    }
  }, [inviteLoading, invite, modal.type, modal.state?.guildId, mutate]);

  const loading = inviteLoading || createInviteLoading;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className={"text-left"}>
          <DialogTitle>Invite People</DialogTitle>
          <DialogDescription>
            Generate a link that you can send to people you want to invite.
          </DialogDescription>
        </DialogHeader>
        <div className={"flex items-center gap-1"}>
          <Input
            disabled={loading}
            value={
              loading
                ? "Loading..."
                : invite?.id
                ? `${getBaseUrl()}/invite/${invite.id}`
                : `No invite code, generate one.`
            }
            onChange={(e) => {}}
          />
          <TooltipWrapper content={"Generate New Invite"} side={"top"}>
            <Button
              size={"icon"}
              onClick={() => mutate(modal.state?.guildId || "")}
            >
              <RefreshCcw size={16} />
            </Button>
          </TooltipWrapper>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServerInviteModal;
