import Chats from "@/components/route_component/chats";
import FetchChatData from "@/components/route_component/fetch-chat-data";
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
