"use client";

import { LucideIcon, Send } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type ButtonWithTooltipProps = {
  tooltip: string;
  Icon: LucideIcon;
  onClick: () => void;
};

const ButtonWithTooltip = ({
  tooltip,
  Icon,
  onClick,
}: ButtonWithTooltipProps) => {
  return (
    <div className="relative w-full h-[50px] flex justify-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"outline"}
              className="w-[50px] h-full p-2"
              onClick={onClick}
            >
              <Icon size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={"left"}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const DirectMessagesButton = () => {
  return (
    <ButtonWithTooltip
      tooltip={"Direct messages"}
      Icon={Send}
      onClick={() => {}}
    />
  );
};

export const ServerButton = () => {
  return (
    <ButtonWithTooltip tooltip={"Server"} Icon={Send} onClick={() => {}} />
  );
};
