"use client";

import GroupChatHeader from "@/components/group/GroupChatHeader";
import GroupChatInput from "@/components/group/GroupChatInput";
import GroupMessageBubble from "@/components/group/GroupMessageBubble";

const GroupChatPage = () => {
  return (
    <div className="flex flex-col h-full">
      <GroupChatHeader />
      <div className="flex-grow overflow-y-auto p-6">
        <GroupMessageBubble />
      </div>
      <div className="flex-shrink-0">
        <GroupChatInput />
      </div>
    </div>
  );
};

export default GroupChatPage;
