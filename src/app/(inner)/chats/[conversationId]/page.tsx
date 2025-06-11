"use client";
import ChatPage from "@/components/chats/ChatPage";
import { useParams } from "next/navigation";

const ChatsPage = () => {
  const params = useParams<{ conversationId: string }>();
  return <ChatPage conversationId={params.conversationId} />;
  // return <FetchChatData stringId={conversationId} />;
};

export default ChatsPage;
