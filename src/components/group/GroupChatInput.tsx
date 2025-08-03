"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { SendHorizonal as LucideSendHorizonal } from "lucide-react";
import { useGroupChatStore } from "@/contexts/GroupChatContext";

// Utility Functions
const escapeHtml = (str: string): string => {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "<",
    ">": ">",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (match) => escapeMap[match]);
};

const linkify = (text: string): string => {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    const escapedUrl = escapeHtml(url);
    const displayUrl =
      escapedUrl.length > 35 ? `${escapedUrl.substring(0, 35)}...` : escapedUrl;
    return `<a href="${escapedUrl}" class="link-style" target="_blank">${displayUrl}</a>`;
  });
};

const GroupChatInput = () => {
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { sendMessage, setTypingStatus } = useGroupChatStore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value);

    // Handle typing indicator
    const value = e.target.value;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Send typing status
    if (value.length > 0) {
      setTypingStatus(true);

      // Set timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false);
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
      setTypingStatus(false);
    }
  };

  const sendIfValid = () => {
    const trimmedMessage = messageContent.trim();
    if (!trimmedMessage || sendingMessage) return;

    setSendingMessage(true);

    // Clear typing timeout and status when sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTypingStatus(false);

    const processedMessage = linkify(escapeHtml(trimmedMessage));
    sendMessage(processedMessage, []);
    setMessageContent("");
    setSendingMessage(false);
  };

  const handleSendClick = (
    e: KeyboardEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>,
  ) => {
    if ("key" in e && e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      sendIfValid();
    } else if (!("key" in e)) {
      sendIfValid();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      sendIfValid();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center p-6 space-x-2 dark:bg-gray-800">
      <input
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        value={messageContent}
        className="flex-grow px-4 py-4 border border-gray-300 resize-none rounded-md focus:outline-none focus:border-blue-500"
        placeholder="Type a message..."
      />
      <button
        disabled={sendingMessage}
        onClick={handleSendClick}
        className="px-4 py-4 text-white cursor-pointer bg-primary-dark-pink rounded-md hover:bg-primary-text-dark-pink disabled:bg-gray-500"
        aria-label="Send message"
        type="button"
      >
        <LucideSendHorizonal className="w-5 h-5" />
      </button>
    </div>
  );
};

export default GroupChatInput;
