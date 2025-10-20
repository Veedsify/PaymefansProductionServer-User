"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { getSocket } from "@/components/common/Socket";
import type { ChatMessage } from "@/lib/api/types";

interface UseChatMessagesProps {
  conversationId: string;
}

export const useChatMessages = ({ conversationId }: UseChatMessagesProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [nextCursor, setNextCursor] = useState<string | number | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const { chat } = useApi();

  // Fetch first page on mount or conversationId change
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await chat.getMessages(conversationId);
        console.log("Messages response:", response.data);

        // Handle the direct API response structure (no nested data.data)
        // API returns messages in descending order (newest first), but we need ascending order (oldest first)
        const messages = response.data.messages || [];
        setChatMessages([...messages].reverse());
        setNextCursor(response.data.nextCursor ?? undefined);
        setHasMore(!!response.data.nextCursor);
      } catch (err: any) {
        setError(err);
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]); // Remove 'chat' from dependencies

  // Function to fetch the next page
  const fetchNextPage = useCallback(async () => {
    if (!nextCursor || !hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chat.getMessages(
        conversationId,
        typeof nextCursor === "string" ? parseInt(nextCursor) : nextCursor
      );
      // Handle the direct API response structure (no nested data.data)
      // API returns messages in descending order (newest first), but we need ascending order (oldest first)
      const newMessages = response.data.messages || [];
      setChatMessages((prev) => [...newMessages].reverse().concat(prev));
      setNextCursor(response.data.nextCursor ?? undefined);
      setHasMore(!!response.data.nextCursor);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching next page:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, nextCursor, hasMore, loading]); // Remove 'chat' from dependencies

  // Search for a specific message
  const searchForSpecificMessage = useCallback(
    async (messageId: string) => {
      try {
        const response = await chat.searchMessages(conversationId, messageId);
        const { data } = response.data;

        return data.find(
          (msg: ChatMessage) =>
            msg.message_id === messageId || String(msg.id) === messageId
        );
      } catch (error) {
        console.error("Error searching for specific message:", error);
        return null;
      }
    },
    [conversationId] // Remove 'chat' from dependencies
  );

  // Socket listeners for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      console.log("Received new message via socket:", message);
      setChatMessages((prev) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(
          (m) => m.message_id === message.message_id
        );
        if (messageExists) return prev;

        // Add new message to the end of the array (most recent at bottom)
        return [...prev, message];
      });
    };

    const handleMessageUpdate = (updatedMessage: ChatMessage) => {
      console.log("Received message update via socket:", updatedMessage);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === updatedMessage.message_id ? updatedMessage : msg
        )
      );
    };

    // Listen for new messages
    socket.on("message", handleNewMessage);
    socket.on("message-update", handleMessageUpdate);

    return () => {
      socket.off("message", handleNewMessage);
      socket.off("message-update", handleMessageUpdate);
    };
  }, [conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setNextCursor(undefined);
      setHasMore(false);
      setLoading(false);
      setError(null);
      setChatMessages([]);
    };
  }, []);

  // Function to add a message optimistically (for sender)
  const addMessageOptimistically = useCallback((message: ChatMessage) => {
    setChatMessages((prev) => {
      // Check if message already exists to prevent duplicates
      const messageExists = prev.some(
        (m) => m.message_id === message.message_id
      );
      if (messageExists) return prev;

      // Add new message to the end of the array (most recent at bottom)
      return [...prev, message];
    });
  }, []);

  return {
    chatMessages,
    loading,
    error,
    nextCursor,
    hasMore,
    fetchNextPage,
    searchForSpecificMessage,
    addMessageOptimistically,
  };
};
