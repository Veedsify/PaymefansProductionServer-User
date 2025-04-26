import ConversationComponent from "@/components/sub_components/conversation-components";
import MessageCounter from "@/components/sub_components/message-counter";
import MessageSearch from "@/components/sub_components/message-search";
import { MessagesConversationProvider } from "@/contexts/messages-conversation-context";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Profile page",
};

const Messages = async () => {
  return (
    <div className="md:py-5 md:px-8 p-3">
      <MessageCounter />
      <MessageSearch />
      <MessagesConversationProvider>
        <ConversationComponent />
      </MessagesConversationProvider>
    </div>
  );
};

export default Messages;
