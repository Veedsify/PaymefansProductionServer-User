"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { useChatStore } from "@/contexts/ChatContext";
import type { Message } from "@/types/Components";
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
  const addNewMessage = useChatStore((state) => state.addNewMessage);
  const paginateMessages = useChatStore((state) => state.paginateMessages);
  const resetMessages = useChatStore((state) => state.resetMessages);

  // Fetch first page on mount or conversationId change
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await chat.getMessages(conversationId);
        const { data } = response.data;

        setChatMessages(data.data || []);
        setNextCursor(data.nextCursor ?? undefined);
        setHasMore(!!data.nextCursor);
      } catch (err: any) {
        setError(err);
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, chat]);

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
      const { data } = response.data;

      setChatMessages((prev) => [...prev, ...(data.data || [])]);
      setNextCursor(data.nextCursor ?? undefined);
      setHasMore(!!data.nextCursor);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching next page:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, nextCursor, hasMore, loading, chat]);

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
    [conversationId, chat]
  );

  // Update messages in global store
  useEffect(() => {
    // Convert ChatMessage[] to Message[] for compatibility
    const messages = chatMessages.map((msg) => ({
      ...msg,
      id: parseInt(msg.id) || 0, // Convert string id to number
      message: msg.content, // Map content to message field
      attachment: msg.attachment || [], // Ensure attachment is always an array
      triggerSend: msg.triggerSend || false, // Ensure triggerSend is always boolean
    }));
    paginateMessages(messages);
  }, [chatMessages, paginateMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setNextCursor(undefined);
      setHasMore(false);
      setLoading(false);
      setError(null);
      setChatMessages([]);
      resetMessages();
    };
  }, [resetMessages]);

  return {
    chatMessages,
    loading,
    error,
    nextCursor,
    hasMore,
    fetchNextPage,
    searchForSpecificMessage,
  };
};
