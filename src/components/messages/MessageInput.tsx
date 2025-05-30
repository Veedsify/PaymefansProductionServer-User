"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  RefObject,
} from "react";
import { v4 as uuid } from "uuid";
import { LucidePlus, LucideCamera, LucideSendHorizonal, X } from "lucide-react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { useUserPointsContext } from "@/contexts/PointsContext";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";
import { useMediaContext } from "@/contexts/MessageMediaContext";
import { MessageInputProps, Attachment } from "@/types/Components";
import UploadMediaModal from "../sub_components/UploadMediaModal";
import MessageInputAttachmentPreview from "./MessageInputAttachmentPreview";

// Utility Functions
const escapeHtml = (str: string) => {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (match) => escapeMap[match]);
};

export const linkify = (text: string) => {
  if (!text) return "";
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
  // Contexts and Hooks
  const { user } = useUserAuthContext();
  const { points } = useUserPointsContext();
  const { conversations } = useMessagesConversation();
  const { message, setMessage, mediaFiles, addFiles, removeFile, resetAll } =
    useMediaContext();
  const [isTyping, setIsTyping] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<number | null>(null);
  const token = getToken();

  // Message Sending Logic
  const sendMessageWithAttachment = useCallback(
    async (message: string) => {
      if (!user || !receiver) return;

      const generateNumericId = () =>
        Math.floor(Math.random() * 1000000000) + 1;

      sendMessage({
        message_id: uuid(),
        message: linkify(message.trim()),
        attachment: [] as Attachment[],
        sender_id: user.user_id,
        receiver_id: receiver.user_id,
        seen: false,
        rawFiles: mediaFiles,
        triggerSend: true,
        id: generateNumericId(),
        created_at: new Date().toString(),
      });

      if (ref.current) ref.current.innerHTML = "";
      resetAll();
    },
    [sendMessage, user, mediaFiles, resetAll, receiver]
  );

  const resetMessageInput = useCallback(() => {
    setMessage("");
    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.focus();
    }
  }, [setMessage]);

  const handleSendMessage = useCallback(async () => {
    if (
      !user ||
      !receiver ||
      (message.trim().length === 0 && mediaFiles.length === 0)
    )
      return;

    try {
      const { data } = await axiosInstance.post(
        "/points/price-per-message",
        { user_id: receiver.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const pricePerMessage = data.price_per_message;
      const receiverName =
        receiver.name.charAt(0).toUpperCase() + receiver.name.slice(1);

      if (points < pricePerMessage) {
        resetMessageInput();
        return swal({
          icon: "info",
          title: "Insufficient Paypoints",
          text: `Sorry, you need at least ${pricePerMessage.toLocaleString()} paypoints to send a message to ${receiverName}`,
        });
      }

      if (!conversations[0].lastMessage && pricePerMessage !== 0) {
        const isToSend = await swal({
          icon: "info",
          title: "Notice from PayMeFans",
          text: `Sending a message to ${receiverName} costs ${pricePerMessage.toLocaleString()} paypoints`,
        });
        if (isToSend) sendMessageWithAttachment(message);
        return;
      }

      if (isFirstMessage) {
        const isToSend = await swal({
          icon: "info",
          title: "Notice from PayMeFans",
          text: `Your first message to ${receiver.name} costs ${pricePerMessage} paypoints`,
          dangerMode: true,
          buttons: ["Cancel", "Continue"],
        });
        if (isToSend) sendMessageWithAttachment(message);
        return;
      }

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

  // Typing and Input Handling
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (message.length > 0) {
        setIsTyping(true);
        sendTyping(message);
      }

      if (typingTimeout.current) clearTimeout(typingTimeout.current);
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

  // Media Handling
  const triggerFileSelect = useCallback(() => {
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    fileInput?.click();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const imageTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
        "image/webp",
        "image/bmp",
        "image/tiff",
        "image/ico",
      ];

      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(
          (file) =>
            imageTypes.includes(file.type) || file.type.startsWith("video/")
        );

        if (validFiles.length !== selectedFiles.length) {
          toast.error(
            "Invalid file type, please select an image or video file"
          );
          return;
        }

        addFiles(e.target.files);
      }
    },
    [addFiles]
  );

  // Render Components
  const mediaPreviewBadge = mediaFiles.length > 0 && (
    <div className="grid grid-cols-6 gap-2 text-white rounded-full">
      {mediaFiles.map((file, index) => (
        <div key={index} className="relative w-full aspect-square">
          <button
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 transition-colors rounded-full p-1 shadow"
            onClick={() => removeFile(index)}
            aria-label="Remove media"
          >
            <X size={14} stroke="#fff" />
          </button>
          <MessageInputAttachmentPreview
            previewUrl={file?.previewUrl ?? ""}
            type={file?.type ?? ""}
            posterUrl={file?.posterUrl ?? ""}
          />
        </div>
      ))}
    </div>
  );

  if (receiver && !receiver.active_status) {
    return (
      <div className="flex items-center justify-center h-full py-4 space-y-2 text-center">
        <p className="text-gray-500 dark:text-white">
          {receiver.name} is currently suspended.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bottom-0 lg:ml-4 lg:mr-2 relative max-h-max">
        <div className="flex flex-col w-full gap-2 border border-black/20 rounded-2xl px-2 dark:bg-gray-950 py-2 lg:rounded-xl">
          {mediaPreviewBadge}
          <div className="flex items-center justify-between w-full gap-2">
            <div
              ref={ref as RefObject<HTMLDivElement>}
              contentEditable
              id="message-input"
              data-placeholder="Type your message..."
              onKeyDown={handleKeyDown}
              className="bg-transparent outline-none w-full p-2 rounded-xl border-black/20 dark:border-gray-600 font-semibold resize-none dark:text-white overflow-auto max-h-24"
            />
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              id="file-input"
              onChange={handleFileSelect}
              multiple
            />
            <div className="flex gap-2 rounded-xl p-1.5">
              <span className="cursor-pointer" onClick={triggerFileSelect}>
                <LucidePlus stroke="#CC0DF8" size={25} />
              </span>
              <span className="cursor-pointer" onClick={triggerFileSelect}>
                <LucideCamera stroke="#CC0DF8" size={25} />
              </span>
              <span className="cursor-pointer ml-2" onClick={handleSendMessage}>
                <LucideSendHorizonal stroke="#CC0DF8" size={24} />
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* <UploadMediaModal /> */}
    </>
  );
};

export default MessageInput;
