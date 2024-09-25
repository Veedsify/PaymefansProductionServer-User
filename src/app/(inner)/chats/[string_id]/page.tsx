import Chats from "@/components/route_component/chats";
import FetchChatData from "@/components/route_component/fetch-chat-data";
import GetConversationMessages from "@/utils/data/get-conversation-messages";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chats",
  description: "Chats",
};

const ChatsPage = async ({ params }: { params: { string_id: string } }) => {
  return <FetchChatData stringId={params.string_id} />;
};

export default ChatsPage;
