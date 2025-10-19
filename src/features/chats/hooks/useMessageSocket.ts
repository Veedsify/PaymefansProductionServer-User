"use client";

import { useCallback, useEffect, useState } from "react";
import { getSocket } from "@/components/common/Socket";
import { useChatStore } from "@/contexts/ChatContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { Message } from "@/types/Components";

interface UseMessageSocketProps {
  conversationId: string;
  receiver: any;
  onMessageSent?: (message: Message) => void;
  onMessageError?: (error: any) => void;
}

export const useMessageSocket = ({
  conversationId,
  receiver,
  onMessageSent,
  onMessageError,
}: UseMessageSocketProps) => {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const socket = getSocket();
  const { user } = useAuthContext();
  const addNewMessage = useChatStore((state) => state.addNewMessage);

  // Check socket connection
  const checkSocketConnection = useCallback(async () => {
    if (!socket) return false;

    if (socket.connected) {
      setIsSocketConnected(true);
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        socket.off("connect", handleConnect);
        resolve(false);
      }, 5000);

      const handleConnect = () => {
        clearTimeout(timeout);
        socket.off("connect", handleConnect);
        setIsSocketConnected(true);
        resolve(true);
      };

      socket.on("connect", handleConnect);
      socket.connect();
    });
  }, [socket]);

  // Send message via socket
  const sendMessage = useCallback(
    async (messageData: any) => {
      if (!socket || !conversationId || !user) {
        throw new Error("Socket or conversation not available");
      }

      setIsSending(true);

      try {
        // Ensure socket is connected
        const connected = await checkSocketConnection();
        if (!connected) {
          throw new Error("Socket connection failed");
        }

        // Join conversation if not already joined
        socket.emit("join", conversationId);

        // Send message
        socket.emit("new-message", {
          conversationId,
          content: messageData.content,
          attachment: messageData.attachment || [],
          points_required: messageData.points_required || 0,
          receiver_id: receiver?.user_id,
        });

        // Wait for response
        return new Promise<Message>((resolve, reject) => {
          const timeout = setTimeout(() => {
            socket.off("message-sent", handleMessageSent);
            socket.off("message-error", handleMessageError);
            reject(new Error("Message send timeout"));
          }, 10000);

          const handleMessageSent = (message: Message) => {
            clearTimeout(timeout);
            socket.off("message-sent", handleMessageSent);
            socket.off("message-error", handleMessageError);

            // Add to local state
            addNewMessage(message);
            onMessageSent?.(message);
            resolve(message);
          };

          const handleMessageError = (error: any) => {
            clearTimeout(timeout);
            socket.off("message-sent", handleMessageSent);
            socket.off("message-error", handleMessageError);

            onMessageError?.(error);
            reject(new Error(error.message || "Message send failed"));
          };

          socket.on("message-sent", handleMessageSent);
          socket.on("message-error", handleMessageError);
        });
      } catch (error) {
        console.error("Socket send error:", error);
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [
      socket,
      conversationId,
      user,
      receiver,
      checkSocketConnection,
      addNewMessage,
      onMessageSent,
      onMessageError,
    ]
  );

  // Handle typing indicator
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!socket || !conversationId || !user) return;

      socket.emit("typing", {
        conversationId,
        isTyping,
        receiver_id: receiver?.user_id,
      });
    },
    [socket, conversationId, user, receiver]
  );

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation
    socket.emit("join", conversationId);

    // Handle connection status
    const handleConnect = () => {
      setIsSocketConnected(true);
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, conversationId]);

  return {
    isSocketConnected,
    isSending,
    sendMessage,
    sendTypingIndicator,
    checkSocketConnection,
  };
};
