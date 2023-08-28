"use client";

import { type ProcedureOutputs } from "@/app/_trpc/serverClient";
import { ServerButton } from "./server-button";
import { usePathname } from "next/navigation";

type ServerProps = {
  server: NonNullable<ProcedureOutputs["getGuilds"]>[number];
};

const Server = ({ server }: ServerProps) => {
  const params = usePathname();
  const active = params.includes(server.id);

  return (
    <div className="relative flex items-center group">
      <div
        className={
          "h-0 group-hover:h-[20px] w-[10px] transition-all ease-out duration-200 bg-primary absolute -left-[5px] rounded-lg"
        }
        style={
          active
            ? {
                height: "30px",
              }
            : {}
        }
      ></div>
      <ServerButton
        tooltip={server.name}
        imageUrl={server.image ? server.image.url : "nope"}
        className={"rounded-2xl hover:rounded-xl transition-all duration-200"}
        style={
          active
            ? {
                borderRadius: "var(--radius)",
              }
            : {}
        }
        onClick={() => {}}
        href={`/server/${server.id}`}
      />
    </div>
  );
};

export default Server;
