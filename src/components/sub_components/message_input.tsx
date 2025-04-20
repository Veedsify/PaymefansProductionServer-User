"use client";
import { useUserPointsContext } from "@/contexts/user-points-context";
import { useUserAuthContext } from "@/lib/userUseContext";
import { LucidePlus, LucideCamera, LucideSendHorizonal } from "lucide-react";
import {
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { useMessageContext } from "@/contexts/messages-conversation-context";
import { Attachment, MessageInputProps } from "@/types/components";
import axiosInstance from "@/utils/axios";
import { getToken } from "@/utils/cookie.get";
import { useMediaContext } from "@/contexts/message-media-context";
import UploadMediaModal from "./upload-media-modal";

// Utility functions
const escapeHtml = (str: string) => {
  return str.replace(/[&<>"']/g, (match) => {
    const escapeMap: any = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return escapeMap[match];
  });
};

export const linkify = (text: string) => {
  if (!text || text.length === 0) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.replace(urlRegex, (url) => {
    const escapedUrl = escapeHtml(url);
    const displayUrl =
      escapedUrl.length > 35 ? `${escapedUrl.substring(0, 35)}...` : escapedUrl;
    return `<a href="${escapedUrl}" class="link-style" target="_blank">${displayUrl}</a>`;
  });
};

const MessageInput = ({
  sendMessage,
  sendTyping,
  receiver,
  isFirstMessage,
}: MessageInputProps) => {
  const { user } = useUserAuthContext();
  const ref = useRef<HTMLDivElement>(null);
  const { points } = useUserPointsContext();
  const { conversations } = useMessageContext();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<number | null>(null);
  const token = getToken();

  // abort controller
  const { message, setMessage, mediaFiles, openModal, resetAll } =
    useMediaContext();

  const sendMessageWithAttachment = useCallback(
    async (message: string) => {
      if (!user) return;

      let attachments: Attachment[] = [];

      const generateNumericId = () =>
        Date.now() * 1000 + Math.floor(Math.random() * 1000);
      sendMessage({
        message_id: generateNumericId(),
        message: linkify(message.trim()),
        attachment: attachments,
        sender_id: user.user_id,
        seen: false,
        rawFiles: mediaFiles,
        triggerSend: true,
        id: generateNumericId(),
        created_at: new Date().toString(),
      });

      if (ref.current) {
        ref.current.innerHTML = "";
      }
      resetAll();
    },
    [sendMessage, user, mediaFiles, token, resetAll]
  );

  const resetMessageInput = () => {
    setMessage("");
    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.focus();
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!user) return;

    // If message is empty and no media files, do nothing
    if (message.trim().length === 0 && mediaFiles.length === 0) return;

    try {
      const pricePerMessage = await axiosInstance
        .post(
          "/points/price-per-message",
          { user_id: receiver.user_id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => res.data.price_per_message);

      const receiverName = receiver?.name
        ? receiver.name.charAt(0).toUpperCase() + receiver.name.slice(1)
        : "";

      // Check if user has enough points
      if (points < pricePerMessage) {
        resetMessageInput();
        return swal({
          icon: "info",
          title: "Insufficient Paypoints",
          text: `Sorry, you need to have at least ${pricePerMessage.toLocaleString()} paypoints to send a message to ${receiverName}`,
        });
      }

      // Handle first message notice
      if (!conversations[0].lastMessage && pricePerMessage !== 0) {
        return swal({
          icon: "info",
          title: "Notice from PayMeFans",
          text: `Take note sending a message to ${receiverName} would cost you ${pricePerMessage.toLocaleString()} paypoints`,
        }).then((isToSend) => {
          if (isToSend) {
            sendMessageWithAttachment(message);
          }
        });
      }

      // Handle first message special case
      if (isFirstMessage) {
        return swal({
          icon: "info",
          title: "Notice from PayMeFans",
          text: `You are about to send your first message to ${receiver.name}, this would cost you ${pricePerMessage} paypoints`,
          dangerMode: true,
          buttons: ["Cancel", "Continue"],
        }).then((isToSend) => {
          if (isToSend) {
            sendMessageWithAttachment(message);
          }
        });
      }

      // Normal message sending
      sendMessageWithAttachment(message);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  }, [
    user,
    receiver,
    points,
    conversations,
    sendMessageWithAttachment,
    message,
    isFirstMessage,
    token,
    mediaFiles.length,
    resetMessageInput,
  ]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (message.length > 0) {
        setIsTyping(true);
        sendTyping(message);
      }

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      typingTimeout.current = window.setTimeout(() => {
        setIsTyping(false);
        sendTyping("");
      }, 1000);

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
        setIsTyping(false);
        sendTyping("");
      }
    },
    [sendTyping, message, handleSendMessage]
  );

  // Handle contentEditable synchronization with state
  useEffect(() => {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setMessage(target.innerHTML);
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain");
      document.execCommand("insertText", false, text);
    };

    const messageInput = ref.current;

    if (messageInput) {
      messageInput.addEventListener("input", handleInput);
      messageInput.addEventListener("paste", handlePaste);
    }

    return () => {
      if (messageInput) {
        messageInput.removeEventListener("input", handleInput);
        messageInput.removeEventListener("paste", handlePaste);
      }
    };
  }, [setMessage]);

  // Show preview badge if we have media files
  const mediaPreviewBadge =
    mediaFiles.length > 0 ? (
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-primary-dark-pink text-white px-4 py-2 rounded-full">
        {mediaFiles.length} {mediaFiles.length === 1 ? "file" : "files"}{" "}
        selected
      </div>
    ) : null;

  return (
    <>
      <div className="bottom-0 lg:ml-4 lg:mr-2 relative max-h-max">
        {mediaPreviewBadge}
        <div className="flex mb-2 items-center gap-5 px-6 dark:bg-gray-800 bg-gray-  lg:py-2 py-4 lg:rounded-xl">
          <div
            ref={ref as RefObject<HTMLDivElement>}
            contentEditable={true}
            id="message-input"
            onKeyDown={handleKeyDown}
            className="bg-transparent outline-none w-full p-2 font-semibold resize-none dark:text-white overflow-auto max-h-24"
          ></div>
          <span className="cursor-pointer" onClick={openModal}>
            <LucidePlus stroke="#CC0DF8" size={25} />
          </span>
          <span className="cursor-pointer" onClick={openModal}>
            <LucideCamera stroke="#CC0DF8" size={25} />
          </span>
          <span className="cursor-pointer" onClick={handleSendMessage}>
            <LucideSendHorizonal stroke="#CC0DF8" size={25} />
          </span>
        </div>
      </div>

      <UploadMediaModal />
    </>
  );
};

export default MessageInput;
