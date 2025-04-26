import FetchChatData from "@/components/messages/fetch-chat-data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chats",
  description: "Chats",
};
type paramsProp = Promise<{ string_id: string }>;
const ChatsPage = async ({ params }: { params: paramsProp }) => {
  const { string_id } = await params;
  return <FetchChatData stringId={string_id} />;
};

export default ChatsPage;
