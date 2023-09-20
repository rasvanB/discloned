"use client";

import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { env } from "@/env.mjs";
import { Loader2 } from "lucide-react";

type MediaRoomProps = {
  roomId: string;
  video: boolean;
  audio: boolean;
};

const MediaRoom = ({ roomId, video, audio }: MediaRoomProps) => {
  const { data: session } = useSession();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${roomId}&username=${session.user.name}`,
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [session, roomId]);

  if (token === "") {
    return (
      <div
        className={"bg-card/50 flex items-center justify-center w-full h-full"}
      >
        <Loader2 className={"animate-spin mr-2"} size={24} />
        <span className={"text-xl"}>Loading...</span>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      video={video}
      audio={audio}
      token={token}
      serverUrl={env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};

export default MediaRoom;
