"use client";

import { GroupChatProvider } from "@/contexts/GroupChatContext";

const GroupsLayout = ({ children }: { children: React.ReactNode }) => {
  return <GroupChatProvider>{children}</GroupChatProvider>;
};

export default GroupsLayout;
