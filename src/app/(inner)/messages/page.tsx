import ConversationComponent from "@/features/chats/comps/ConversationComponent";
import MessageCounter from "@/features/chats/comps/MessageCounter";
import MessageSearch from "@/features/chats/comps/MessageSearch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Profile page",
};

const Messages = async () => {
  return (
    <div className="p-3 md:py-5 md:px-8">
      <MessageCounter />
      <MessageSearch />
      <ConversationComponent />
    </div>
  );
};

export default Messages;
