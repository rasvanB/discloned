"use client";

import { trpc } from "@/app/_trpc/client";
import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronDown, Hash, Plus, Video, Volume2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

const ChannelIconsMap = {
  text: <Hash size={16} className="text-secondary-foreground/80" />,
  voice: <Volume2Icon size={15} />,
  video: <Video size={15} />,
};

const ChannelList = ({
  initialData,
  guildId,
}: {
  initialData: NonNullable<ProcedureOutputs["getGuildById"]>["channels"];
  guildId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = trpc.getChannelsForGuild.useQuery(guildId, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Failed to load channels</div>;
  }

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
                  "transition-transform"
                )}
              />
              <h4 className="text-sm font-semibold leading-tight">Channels</h4>
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
          <Button variant="ghost" size={"icon"}>
            <Plus size={16} />
          </Button>
        </div>
        {data[0] && (
          <Button
            variant={"ghost"}
            className="flex items-center gap-1 w-full justify-start"
          >
            <div>{ChannelIconsMap[data[0].type]}</div>
            <span className="leading-none font-medium text-sm">
              {data[0].name}
            </span>
          </Button>
        )}
        <CollapsibleContent className="space-y-2">
          {data.slice(1).map((channel) => (
            <div key={channel.id}>{channel.name}</div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ChannelList;
