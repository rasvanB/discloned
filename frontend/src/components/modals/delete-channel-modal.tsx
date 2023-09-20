"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useModal } from "@/hooks/use-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_trpc/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getQueryKey } from "@trpc/react-query";
import { queryClient } from "@/app/_trpc/provider";

const DeleteChannelModal = () => {
  const { modal, isOpen, onClose } = useModal();
  const isModalOpen = modal.type === "deleteChannel" && isOpen;

  const router = useRouter();

  const { isLoading, mutate } = trpc.deleteChannel.useMutation({
    onSuccess: async () => {
      if (!modal.state || !modal.state.guildId) return;
      const queryKey = getQueryKey(
        trpc.getChannelsForGuild,
        modal.state.guildId,
        "query",
      );
      await queryClient.invalidateQueries(queryKey);
      router.push(`/server/${modal.state.guildId}`);
      onClose();
    },
  });

  if (modal.type !== "deleteChannel") return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className={"text-left"}>
          <DialogTitle>Delete Channel</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this channel? This action is
            irreversible, and all messages and content within the channel will
            be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <div className={"w-full flex justify-end items-center gap-2"}>
          <Button variant={"secondary"} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            disabled={isLoading}
            onClick={() =>
              mutate({
                guildId: modal.state.guildId,
                channelId: modal.state.channelId,
              })
            }
          >
            {isLoading && <Loader2 size={16} className={"mr-2 animate-spin"} />}
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteChannelModal;
