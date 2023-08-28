"use client";

import { LucideIcon, Send } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ServerButtonProps = {
  Icon?: LucideIcon;
  imageUrl?: string;
  tooltip: string;
  href: string;
  className?: string;
  onClick: () => void;
  style?: React.CSSProperties;
};

export const ServerButton = ({
  tooltip,
  Icon,
  imageUrl,
  onClick,
  className,
  href,
  style,
}: ServerButtonProps) => {
  return (
    <div className="relative w-full h-[50px] flex justify-center">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Link href={href}>
              <Button
                style={style}
                variant={"outline"}
                className={cn(className, "w-[50px] h-full p-0 overflow-hidden")}
                onClick={onClick}
              >
                {Icon && <Icon size={20} />}
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt="server icon"
                    width={100}
                    height={100}
                    className="w-[50px] h-[50px]"
                  />
                )}
              </Button>
            </Link>
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
    <ServerButton
      tooltip={"Direct messages"}
      Icon={Send}
      onClick={() => {}}
      href="/server/me"
    />
  );
};
