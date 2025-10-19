"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { useApi } from "@/lib/api";
import { usePointsStore } from "@/contexts/PointsContext";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";

interface MessageValidationProps {
  receiver: any;
  conversationId: string;
  isFirstMessage: boolean;
  conversations: any[];
}

export const useMessageValidation = ({
  receiver,
  conversationId,
  isFirstMessage,
  conversations,
}: MessageValidationProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const { chat, points: pointsApi } = useApi();
  const points = usePointsStore((state) => state.points);
  const { conversations: conversationList } = useMessagesConversation();

  // Check if user can send message
  const canSendMessage = useCallback(() => {
    if (!receiver) return false;
    if (!conversationId) return false;
    return true;
  }, [receiver, conversationId]);

  // Validate points and get price per message
  const validatePoints = useCallback(async () => {
    if (!receiver?.user_id) return { canSend: false, price: 0 };

    try {
      setIsValidating(true);
      const { data } = await pointsApi.getPricePerMessage(receiver.user_id);
      const pricePerMessage = data.data.price_per_message;

      // Check if user has enough points
      if (points < pricePerMessage) {
        const receiverName =
          receiver.name.charAt(0).toUpperCase() + receiver.name.slice(1);

        await swal({
          icon: "info",
          title: "Insufficient Points",
          text: `You have ${points} points but need ${pricePerMessage.toLocaleString()} points to send a message to ${receiverName}`,
          buttons: ["Cancel", "Add Points"],
        });

        return { canSend: false, price: pricePerMessage };
      }

      return { canSend: true, price: pricePerMessage };
    } catch (error) {
      console.error("Error validating points:", error);
      toast.error("Failed to validate message cost");
      return { canSend: false, price: 0 };
    } finally {
      setIsValidating(false);
    }
  }, [receiver, points, chat]);

  // Show first message confirmation
  const confirmFirstMessage = useCallback(
    async (pricePerMessage: number) => {
      if (!isFirstMessage || pricePerMessage === 0) return true;

      const receiverName =
        receiver.name.charAt(0).toUpperCase() + receiver.name.slice(1);

      const isToSend = await swal({
        icon: "info",
        title: "Notice from PayMeFans",
        text: `Your first message to ${receiverName} costs ${pricePerMessage} points`,
        dangerMode: true,
        buttons: ["Cancel", "Continue"],
      });

      return !!isToSend;
    },
    [isFirstMessage, receiver]
  );

  // Show conversation message confirmation
  const confirmConversationMessage = useCallback(
    async (pricePerMessage: number) => {
      if (conversations[0]?.lastMessage || pricePerMessage === 0) return true;

      const receiverName =
        receiver.name.charAt(0).toUpperCase() + receiver.name.slice(1);

      const isToSend = await swal({
        icon: "info",
        title: "Notice from PayMeFans",
        text: `Sending a message to ${receiverName} costs ${pricePerMessage.toLocaleString()} points`,
      });

      return !!isToSend;
    },
    [conversations, receiver]
  );

  // Complete validation flow
  const validateMessage = useCallback(async () => {
    // Check basic requirements
    if (!canSendMessage()) {
      toast.error("Cannot send message");
      return { canSend: false, price: 0 };
    }

    // Validate points
    const { canSend, price } = await validatePoints();
    if (!canSend) {
      return { canSend: false, price };
    }

    // Show confirmations if needed
    const firstMessageConfirmed = await confirmFirstMessage(price);
    if (!firstMessageConfirmed) {
      return { canSend: false, price };
    }

    const conversationConfirmed = await confirmConversationMessage(price);
    if (!conversationConfirmed) {
      return { canSend: false, price };
    }

    return { canSend: true, price };
  }, [
    canSendMessage,
    validatePoints,
    confirmFirstMessage,
    confirmConversationMessage,
  ]);

  return {
    isValidating,
    canSendMessage: canSendMessage(),
    validateMessage,
  };
};
