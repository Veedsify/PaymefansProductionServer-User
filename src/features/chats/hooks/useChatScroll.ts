"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

interface UseChatScrollProps {
  messages: any[];
  isUserScrolledUp: boolean;
  setIsUserScrolledUp: (value: boolean) => void;
}

export const useChatScroll = ({
  messages,
  isUserScrolledUp,
  setIsUserScrolledUp,
}: UseChatScrollProps) => {
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const [isSearchingMessage, setIsSearchingMessage] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Auto-scroll functions
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px threshold
      setIsUserScrolledUp(!isScrolledToBottom);
    }
  }, [setIsUserScrolledUp]);

  // Auto-scroll when new messages arrive (if user is at bottom)
  useEffect(() => {
    if (messages.length > 0 && !isUserScrolledUp) {
      setTimeout(() => scrollToBottom(), 100); // Small delay to ensure DOM is updated
    }
  }, [messages.length, isUserScrolledUp, scrollToBottom]);

  // Handle searched message from URL
  useEffect(() => {
    const messageId = searchParams.get("message_id");
    if (!messageId) return;

    // Function to search for message and scroll to it
    const findAndScrollToMessage = () => {
      // Try both message_id formats
      const messageElement =
        document.getElementById(messageId) ||
        document.getElementById(String(messageId)) ||
        document.querySelector(`[id="${messageId}"]`);

      if (messageElement && messagesContainerRef.current) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setHighlightedMessageId(messageId);

        // Remove highlight after 3 seconds
        setTimeout(() => setHighlightedMessageId(null), 3000);

        // Remove message_id from URL without page reload
        const url = new URL(window.location.href);
        url.searchParams.delete("message_id");
        window.history.replaceState({}, "", url.toString());
        return true;
      }
      return false;
    };

    // Only start searching if we have messages loaded
    if (messages.length > 0) {
      setIsSearchingMessage(true);
      // Small delay to ensure messages are rendered
      setTimeout(() => {
        findAndScrollToMessage();
        setIsSearchingMessage(false);
      }, 500);
    }
  }, [messages.length, searchParams]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0) {
      const messageId = searchParams.get("message_id");
      if (messageId) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    }
  }, [messages.length, searchParams, scrollToBottom]);

  return {
    messagesContainerRef,
    highlightedMessageId,
    isSearchingMessage,
    scrollToBottom,
    handleScroll,
  };
};
