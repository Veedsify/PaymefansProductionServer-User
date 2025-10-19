import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { getSocket } from "@/components/common/Socket";

/**
 * Optimized chat hook that manages real-time socket events
 * and efficiently updates React Query cache
 */
export const useOptimizedChat = () => {
  const queryClient = useQueryClient();
  const socket = getSocket();

  // Handle conversation list updates
  const handleConversationUpdate = useCallback(() => {
    // Invalidate conversations to trigger refetch
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }, [queryClient]);

  // Handle unread count updates
  const handleUnreadCountUpdate = useCallback(
    (data: { unreadCount: number }) => {
      queryClient.setQueryData(["conversations"], (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = [...oldData.pages];
        if (newPages[0]) {
          newPages[0] = { ...newPages[0], unreadCount: data.unreadCount };
        }

        return { ...oldData, pages: newPages };
      });
    },
    [queryClient],
  );

  // Handle message updates for specific conversations
  const handleMessageUpdate = useCallback(
    (conversationId: string) => {
      // Invalidate specific conversation messages
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", conversationId],
      });
    },
    [queryClient],
  );

  useEffect(() => {
    // Set up socket listeners
    socket?.on("prefetch-conversations", handleConversationUpdate);
    socket?.on("unread-count-updated", handleUnreadCountUpdate);

    // Cleanup function
    return () => {
      socket?.off("prefetch-conversations", handleConversationUpdate);
      socket?.off("unread-count-updated", handleUnreadCountUpdate);
    };
  }, [socket, handleConversationUpdate, handleUnreadCountUpdate]);

  return {
    // Utility functions for manual cache updates
    invalidateConversations: handleConversationUpdate,
    updateUnreadCount: handleUnreadCountUpdate,
    invalidateMessages: handleMessageUpdate,
  };
};

export default useOptimizedChat;