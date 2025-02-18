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
import UploadMediaComponent from "../route_component/upload-media-conponent";
import swal from "sweetalert";
import { useConversationsContext } from "@/contexts/messages-conversation-context";
import { Attachment, MessageInputProps } from "@/types/components";
import axiosInstance from "@/utils/axios";
import { getToken } from "@/utils/cookie.get";

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
  const [message, setMessage] = useState("");
  const [attachmentModal, setAttachmentModal] = useState(false);
  const { user } = useUserAuthContext();
  const ref = useRef<HTMLDivElement>(null);
  const { points } = useUserPointsContext();
  const { lastMessage } = useConversationsContext();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<number | null>(null);
  const token = getToken();
  const sendMessageWithAttachment = useCallback(
    (message: string, attachment: Attachment[]) => {
      const id = Math.floor(Math.random() * 100000 + 1) + Date.now();
      sendMessage({
        message_id: id,
        message: linkify(message.trim()),
        attachment: attachment,
        sender_id: user?.user_id as string,
        seen: false,
        created_at: new Date().toString(),
      });
    },
    [sendMessage, user],
  );

  const sendNewMessage = useCallback(
    async (attachment: Attachment[]) => {
      if (!user) return;

      const pricePerMessage = await axiosInstance
        .post(
          `/price-per-message`,
          { user_id: receiver.user_id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((res) => res.data.price_per_message);

      console.log(pricePerMessage);
      const processMessageSending = (isFirstMessage: boolean) => {
        const receiverName = receiver?.name
          ? receiver.name.charAt(0).toUpperCase() + receiver.name.slice(1)
          : "";

        const handleInsufficientPoints = () => {
          resetMessageInput();
          return swal({
            icon: "info",
            title: "Insufficient Paypoints",
            text: `Sorry, you need to have at least ${pricePerMessage.toLocaleString()} paypoints to send a message to ${receiverName}`,
          });
        };

        const handleFirstMessageNotice = async () => {
          return swal({
            icon: "info",
            title: "Notice from PayMeFans",
            text: `Take note sending a message to ${receiverName} would cost you ${pricePerMessage.toLocaleString()} paypoints`,
          }).then((isToSend) => {
            if (isToSend) {
              sendMessageWithAttachment(message, attachment);
              resetMessageInput();
            }
          });
        };

        if (points < pricePerMessage) {
          return handleInsufficientPoints();
        }

        if (!lastMessage && pricePerMessage !== 0) {
          return handleFirstMessageNotice();
        }

        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0 && attachment.length === 0) return;

        sendMessageWithAttachment(trimmedMessage, attachment);
        resetMessageInput();
      };

      if (isFirstMessage) {
        swal({
          icon: "info",
          title: "Notice from PayMeFans",
          text: `You are about to send your first message to ${receiver.name}, this would cost you ${pricePerMessage} paypoints `,
          dangerMode: true,
          buttons: ["Cancel", "Continue"],
        }).then((isToSend) => {
          if (isToSend) {
            processMessageSending(isFirstMessage);
          }
        });
      } else {
        processMessageSending(isFirstMessage);
      }
    },
    [
      user,
      receiver,
      points,
      lastMessage,
      sendMessageWithAttachment,
      message,
      isFirstMessage,
      token,
    ],
  );

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
        sendNewMessage([]);
        setIsTyping(false);
        sendTyping("");
      }
    },
    [sendTyping, message, sendNewMessage],
  );

  const resetMessageInput = () => {
    setMessage("");
    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.focus();
    }
  };

  const openAttachmentModal = () => setAttachmentModal(!attachmentModal);
  const closeAttachmentModal = () => setAttachmentModal(false);

  const insertNewMessageFromPreview = (message: string) => {
    const messageWithLink = linkify(message);
    setMessage(messageWithLink);
  };

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
  }, []);

  return (
    <>
      <div className="bottom-0 lg:ml-4 lg:mr-2">
        <div className="flex mb-2 items-center gap-5 px-6 dark:bg-gray-800 bg-gray-100 lg:py-2 py-4 lg:rounded-xl">
          <div
            ref={ref as RefObject<HTMLDivElement>}
            contentEditable={true}
            id="message-input"
            onKeyDown={handleKeyDown} // Fixed reference to `handleKeyDown`
            className="bg-transparent outline-none w-full p-2 font-semibold resize-none dark:text-white"
          ></div>
          <span className="cursor-pointer" onClick={openAttachmentModal}>
            <LucidePlus stroke="#CC0DF8" size={25} />
          </span>
          <span className="cursor-pointer" onClick={openAttachmentModal}>
            <LucideCamera stroke="#CC0DF8" size={25} />
          </span>
          <span className="cursor-pointer" onClick={() => sendNewMessage([])}>
            <LucideSendHorizonal stroke="#CC0DF8" size={25} />
          </span>
        </div>
      </div>
      <UploadMediaComponent
        sendNewMessage={sendNewMessage}
        open={attachmentModal}
        close={closeAttachmentModal}
        setMessage={insertNewMessageFromPreview}
        message={message}
      />
    </>
  );
};

export default MessageInput;
