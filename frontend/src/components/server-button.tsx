"use client";

import { LucideIcon, Send } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CSSProperties } from "react";
import TooltipWrapper from "@/components/tooltip";

type ServerButtonProps = {
  Icon?: LucideIcon;
  imageUrl?: string;
  tooltip: string;
  href: string;
  className?: string;
  style?: CSSProperties;
};

export const ServerButton = ({
  tooltip,
  Icon,
  imageUrl,
  className,
  href,
  style,
}: ServerButtonProps) => {
  return (
    <div className="relative w-full h-[50px] flex justify-center">
      <TooltipWrapper content={tooltip}>
        <Link href={href}>
          <Button
            style={style}
            variant={"outline"}
            className={cn(className, "w-[50px] h-[50px] p-0 overflow-hidden")}
          >
            {Icon && <Icon size={22} />}
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="server icon"
                width={50}
                height={50}
                className="w-[50px] h-[50px]"
                referrerPolicy={"no-referrer"}
              />
            )}
          </Button>
        </Link>
      </TooltipWrapper>
    </div>
  );
};

export const DirectMessagesButton = () => {
  return (
    <ServerButton tooltip={"Direct messages"} Icon={Send} href="/server/me" />
  );
};
