import { Hash } from "lucide-react";

const ChannelGreeting = ({ channelName }: { channelName: string }) => {
  return (
    <div className={"flex flex-col px-4 gap-2 mb-4"}>
      <div
        className={
          "bg-secondary w-fit p-4 rounded-full text-secondary-foreground"
        }
      >
        <Hash size={40} />
      </div>
      <h1 className={"text-4xl font-bold"}>Welcome to #{channelName}!</h1>
      <p className={"text-lg text-secondary-foreground"}>
        This is the start of the #{channelName} channel.
      </p>
      <div className={"w-full h-px bg-border"}></div>
    </div>
  );
};

export default ChannelGreeting;
