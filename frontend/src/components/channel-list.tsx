"use client";

import { trpc } from "@/app/_trpc/client";
import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { ChevronRight, Hash, Plus, Video, Volume2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useModal } from "@/hooks/use-modal";
import CreateChannelModal from "@/components/modals/create-channel-modal";

const ChannelIconsMap = {
  text: <Hash size={16} className="text-secondary-foreground/80" />,
  voice: <Volume2Icon size={16} className="text-secondary-foreground/80" />,
  video: <Video size={16} className="text-secondary-foreground/80" />,
};

const Channel = ({
  currentChannelId,
  guildId,
  channel,
}: {
  currentChannelId?: string | string[];
  guildId: string;
  channel: NonNullable<ProcedureOutputs["getGuildById"]>["channels"][number];
}) => {
  return (
    <Link
      href={`/server/${guildId}/channel/${channel.id}`}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "flex items-center gap-2 w-full justify-start mt-1",
        channel.id === currentChannelId && "bg-accent text-accent-foreground",
      )}
      replace={true}
    >
      {ChannelIconsMap[channel.type]}
      <span className="leading-none font-medium text-sm">{channel.name}</span>
    </Link>
  );
};

const ChannelList = ({
  initialData,
  guildId,
  userRole,
}: {
  guildId: string;
  initialData: NonNullable<ProcedureOutputs["getGuildById"]>["channels"];
  userRole: NonNullable<
    ProcedureOutputs["getGuildById"]
  >["members"][number]["role"];
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const params = useParams();

  const { onOpen } = useModal();

  const handleOpen = () => {
    onOpen({
      type: "createChannel",
      state: {
        guildId,
      },
    });
  };

  const { data } = trpc.getChannelsForGuild.useQuery(guildId, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (!data) {
    return <div>Failed to load channels</div>;
  }

  const currentChannelId = params?.channelID;
  const canEditServer = userRole === "owner" || userRole === "admin";

  const generalChannel = data.find((channel) => channel.name === "general");
  const restChannels = data.filter((channel) => channel.name !== "general");

  return (
    <div className="py-3 px-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-1 w-full justify-start gap-1">
              <ChevronRight
                size={16}
                className={cn(
                  isOpen && "transform rotate-90",
                  "transition-transform",
                )}
              />
              <h4 className="text-sm font-semibold leading-tight">Channels</h4>
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
          {canEditServer && (
            <Button variant="ghost" size={"icon"} onClick={handleOpen}>
              <Plus size={16} />
            </Button>
          )}
        </div>
        {generalChannel && (
          <Channel
            currentChannelId={currentChannelId}
            guildId={guildId}
            channel={generalChannel}
          />
        )}
        <CollapsibleContent className="space-y-1">
          {restChannels.map((channel) => (
            <Channel
              key={channel.id}
              currentChannelId={currentChannelId}
              guildId={guildId}
              channel={channel}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
      {canEditServer && <CreateChannelModal />}
    </div>
  );
};

export default ChannelList;
