"use client";
import { useParams } from "next/navigation";
import ChatPage from "@/features/chats/comps/ChatPage";

const ChatsPage = () => {
  const params = useParams<{ conversationId: string }>();
  return <ChatPage conversationId={params.conversationId} />;
  // return <FetchChatData stringId={conversationId} />;
};

export default ChatsPage;
