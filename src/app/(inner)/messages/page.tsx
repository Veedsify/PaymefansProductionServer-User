import ConversationComponent from "@/components/sub_components/ConversationComponent";
import MessageCounter from "@/components/messages/MessageCounter";
import MessageSearch from "@/components/messages/MessageSearch";
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
