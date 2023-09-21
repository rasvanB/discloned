import { redirect } from "next/navigation";
import { serverClient } from "@/app/_trpc/serverClient";

const Page = async ({
  params,
}: {
  params: {
    conversationID?: string;
  };
}) => {
  if (!params.conversationID) redirect(`/server/me/`);

  const existingConversation = await serverClient.getConversationByUserTwoId(
    params.conversationID,
  );

  const conversation =
    existingConversation ||
    (await serverClient.createConversation({
      userTwoId: params.conversationID,
    }));

  if (!conversation) redirect(`/server/me/`);

  return (
    <div className={"w-full flex flex-col bg-card/50"}>
      conversation {conversation.createdAt.toLocaleDateString()}
    </div>
  );
};

export default Page;
