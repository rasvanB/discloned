"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOutIcon, LucideIcon, Trash } from "lucide-react";
import { ProcedureOutputs } from "@/app/_trpc/serverClient";

const DestructiveMenuItem = ({
  onSelect,
  Icon,
  text,
}: {
  onSelect: () => void;
  text: string;
  Icon: LucideIcon;
}) => {
  return (
    <DropdownMenuItem
      className={
        "text-destructive font-medium focus:text-destructive focus:bg-destructive/20"
      }
      onSelect={onSelect}
    >
      <Icon size={14} className={"mr-2"} /> {text}
    </DropdownMenuItem>
  );
};

const ServerSettings = ({
  userRole,
}: {
  userRole: ProcedureOutputs["getMembersForGuild"][number]["role"];
}) => {
  const canDeleteServer = userRole === "owner" || userRole === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"icon"}>
          <ChevronDown size={20} className="text-accent-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuItem>Invite People</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DestructiveMenuItem
            Icon={LogOutIcon}
            text={"Leave Server"}
            onSelect={() => {}}
          />
          {canDeleteServer && (
            <>
              <DropdownMenuSeparator />
              <DestructiveMenuItem
                Icon={Trash}
                text={"Delete Server"}
                onSelect={() => {}}
              />
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ServerSettings;
