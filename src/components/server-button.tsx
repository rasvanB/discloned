"use client";

import { Send } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const ServerButton = () => {
  return (
    <div className="relative w-full h-[50px] flex justify-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={"outline"} className="w-[50px] h-full p-2">
              <Send size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={"left"}>
            <p>Direct Messages</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ServerButton;
