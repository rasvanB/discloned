"use client";

import { MoonIcon, Settings, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { systemTheme, theme, setTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <Button
      onClick={() => (theme == "dark" ? setTheme("light") : setTheme("dark"))}
      variant="ghost"
      size={"icon"}
    >
      {currentTheme === "dark" ? (
        <SunIcon size={20} className="text-accent-foreground/80" />
      ) : (
        <MoonIcon size={20} className="text-accent-foreground/80" />
      )}
    </Button>
  );
};

const UserSettings = () => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={"icon"}>
            <Settings size={20} className="text-accent-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <div className="flex items-center justify-between">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <ThemeToggle />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={async () => await signOut()}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserSettings;
