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
import { ChevronDown, Hash, Plus, Video, Volume2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

const ChannelIconsMap = {
  text: <Hash size={16} className="text-secondary-foreground/80" />,
  voice: <Volume2Icon size={15} />,
  video: <Video size={15} />,
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
      <div>{ChannelIconsMap[channel.type]}</div>
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
  const [isOpen, setIsOpen] = useState(false);

  const params = useParams();

  const { data, isLoading } = trpc.getChannelsForGuild.useQuery(guildId, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Failed to load channels</div>;
  }

  const currentChannelId = params.channelID;

  return (
    <div className="py-3 px-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-1 w-full justify-start gap-1">
              <ChevronDown
                size={16}
                className={cn(
                  isOpen && "transform rotate-180",
                  "transition-transform",
                )}
              />
              <h4 className="text-sm font-semibold leading-tight">Channels</h4>
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
          {(userRole === "admin" || userRole === "owner") && (
            <Button variant="ghost" size={"icon"}>
              <Plus size={16} />
            </Button>
          )}
        </div>
        {data[0] && (
          <Channel
            currentChannelId={currentChannelId}
            guildId={guildId}
            channel={data[0]}
          />
        )}
        <CollapsibleContent className="space-y-2">
          {data.slice(1).map((channel) => (
            <Channel
              key={channel.id}
              currentChannelId={currentChannelId}
              guildId={guildId}
              channel={channel}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ChannelList;
