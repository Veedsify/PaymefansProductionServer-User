import Chats from "@/components/messages/chats";
import FetchChatData from "@/components/messages/fetch-chat-data";
import GetConversationMessages from "@/utils/data/get-conversation-messages";
import {Metadata} from "next";
import {redirect} from "next/navigation";

export const metadata: Metadata = {
    title: "Chats",
    description: "Chats",
};
type paramsProp = Promise<{ string_id: string }>;
const ChatsPage = async ({params}: { params: paramsProp }) => {
    const {string_id} = await params;
    return <FetchChatData stringId={string_id}/>;
};

export default ChatsPage;
