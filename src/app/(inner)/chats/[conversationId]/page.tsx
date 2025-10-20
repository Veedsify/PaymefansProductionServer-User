"use client";
import { useParams } from "next/navigation";
import { ChatPageContainer } from "@/features/chats/components/ChatPageContainer";

const ChatsPage = () => {
  const params = useParams<{ conversationId: string }>();
  return <ChatPageContainer conversationId={params.conversationId} />;
};

export default ChatsPage;
