"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  RefObject,
  useMemo,
} from "react";
import { v4 as uuid } from "uuid";
import { LucidePlus, LucideCamera, LucideSendHorizonal } from "lucide-react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";
import { MessageInputProps, Attachment } from "@/types/Components";
import MessageMediaPreview from "./MessageMediaPreview";
import React from "react";
import { useChatStore } from "@/contexts/ChatContext";
import { usePointsStore } from "@/contexts/PointsContext";

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

const linkify = (text: string) => {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    const escapedUrl = escapeHtml(url);
    const displayUrl =
      escapedUrl.length > 35 ? `${escapedUrl.substring(0, 35)}...` : escapedUrl;
    return `<a href="${escapedUrl}" class="link-style" target="_blank">${displayUrl}</a>`;
  });
};

const MessageInputComponent = React.memo(
  ({ sendMessage, receiver, isFirstMessage }: MessageInputProps) => {
    // Contexts and Hooks
    const { user } = useUserAuthContext();
    const points = usePointsStore((state) => state.points);
    const { conversations } = useMessagesConversation();
    // const { message, setMessage, mediaFiles, addFiles, removeFile, resetAll } =
    //   useMediaContext();
    const ref = useRef<HTMLDivElement>(null);
    const setIsTyping = useChatStore((state) => state.setIsTyping);
    const token = getToken();

    // State for uploaded media and statuses
    const [uploadedMediaData, setUploadedMediaData] = useState<
      Record<string, Attachment>
    >({});
    const [uploadStatuses, setUploadStatuses] = useState<
      Record<string, "idle" | "uploading" | "completed" | "error">
    >({});

    // // Check if all uploads are complete
    // const allUploadsComplete = useMemo(
    //   () =>
    //     mediaFiles.length === 0 ||
    //     mediaFiles.every(
    //       (file) => uploadStatuses[file.previewUrl] === "completed"
    //     ),
    //   [mediaFiles, uploadStatuses]
    // );

    // Debounce typing indicator
    const debounce = <T extends (...args: any[]) => void>(
      func: T,
      wait: number
    ) => {
      let timeout: NodeJS.Timeout | null = null;
      return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    const debouncedSendTyping = useCallback(
      debounce((msg: string) => {
        if (msg.length > 0) {
          setIsTyping(true);
        } else {
          setIsTyping(false);
        }
      }, 500),
      [setIsTyping]
    );

    // Handlers for upload status and results
    const handleUploadComplete = useCallback(
      (fileKey: string, uploadedData: Attachment) => {
        setUploadedMediaData((prev) => ({ ...prev, [fileKey]: uploadedData }));
        setUploadStatuses((prev) => ({ ...prev, [fileKey]: "completed" }));
      },
      []
    );

    const handleUploadStatusChange = useCallback(
      (
        fileKey: string,
        status: "idle" | "uploading" | "completed" | "error"
      ) => {
        setUploadStatuses((prev) => {
          if (prev[fileKey] === status) return prev;
          return { ...prev, [fileKey]: status };
        });
      },
      []
    );

    // Reset input field
    // const resetMessageInput = useCallback(() => {
    //   setMessage("");
    //   if (ref.current) {
    //     ref.current.innerHTML = "";
    //     ref.current.focus();
    //   }
    // }, [setMessage]);

    // Message Sending Logic
    // const sendMessageWithAttachment = useCallback(
    //   async (msg: string) => {
    //     if (!user || !receiver) return;

    //     const generateNumericId = () =>
    //       Math.floor(Math.random() * 1000000000) + 1;

    //     // Filter valid attachments
    //     const attachments = mediaFiles
    //       .map((file) => uploadedMediaData[file.previewUrl])
    //       .filter(
    //         (attachment): attachment is Attachment =>
    //           !!attachment && !!attachment.url
    //       );

    //     if (mediaFiles.length > 0 && attachments.length === 0) {
    //       toast.error("Some media files failed to upload. Please try again.");
    //       return;
    //     }

    //     sendMessage({
    //       message_id: uuid(),
    //       message: linkify(msg.trim()),
    //       attachment: attachments,
    //       sender_id: user.user_id,
    //       receiver_id: receiver.user_id,
    //       seen: false,
    //       rawFiles: mediaFiles,
    //       triggerSend: true,
    //       id: generateNumericId(),
    //       created_at: new Date().toString(),
    //     });

    //     resetMessageInput();
    //     setUploadedMediaData({});
    //     setUploadStatuses({});
    //   },
    //   [sendMessage, user, mediaFiles, resetAll, receiver, uploadedMediaData]
    // );

    // const handleSendMessage = useCallback(async () => {
    //   if (
    //     !user ||
    //     !receiver ||
    //     (message.trim().length === 0 && mediaFiles.length === 0)
    //   ) {
    //     return;
    //   }

    //   if (!allUploadsComplete) {
    //     toast.error("Please wait for all uploads to finish before sending.");
    //     return;
    //   }

    //   try {
    //     const { data } = await axiosInstance.post(
    //       "/points/price-per-message",
    //       { user_id: receiver.user_id },
    //       { headers: { Authorization: `Bearer ${token}` } }
    //     );
    //     const pricePerMessage = data.price_per_message;
    //     const receiverName =
    //       receiver.name.charAt(0).toUpperCase() + receiver.name.slice(1);

    //     if (points < pricePerMessage) {
    //       resetMessageInput();
    //       return swal({
    //         icon: "info",
    //         title: "Insufficient Paypoints",
    //         text: `Sorry, you need at least ${pricePerMessage.toLocaleString()} paypoints to send a message to ${receiverName}`,
    //       });
    //     }

    //     if (!conversations[0]?.lastMessage && pricePerMessage !== 0) {
    //       const isToSend = await swal({
    //         icon: "info",
    //         title: "Notice from PayMeFans",
    //         text: `Sending a message to ${receiverName} costs ${pricePerMessage.toLocaleString()} paypoints`,
    //       });
    //       if (!isToSend) return;
    //     } else if (isFirstMessage) {
    //       const isToSend = await swal({
    //         icon: "info",
    //         title: "Notice from PayMeFans",
    //         text: `Your first message to ${receiverName} costs ${pricePerMessage} paypoints`,
    //         dangerMode: true,
    //         buttons: ["Cancel", "Continue"],
    //       });
    //       if (!isToSend) return;
    //     }

    //     await sendMessageWithAttachment(message);
    //   } catch (error) {
    //     console.error("Error sending message:", error);
    //     toast.error("Failed to send message");
    //   }
    // }, [
    //   user,
    //   receiver,
    //   points,
    //   conversations,
    //   sendMessageWithAttachment,
    //   message,
    //   isFirstMessage,
    //   token,
    //   mediaFiles.length,
    //   resetMessageInput,
    //   allUploadsComplete,
    // ]);

    // Typing and Input Handling
    // const handleKeyDown = useCallback(
    //   (event: KeyboardEvent) => {
    //     debouncedSendTyping(message);

    //     if (event.key === "Enter" && !event.shiftKey) {
    //       event.preventDefault();
    //       setIsTyping(false);
    //       if (allUploadsComplete) {
    //         handleSendMessage();
    //       } else {
    //         toast.error(
    //           "Please wait for all uploads to finish before sending."
    //         );
    //       }
    //     }
    //   },
    //   [debouncedSendTyping, handleSendMessage, message, allUploadsComplete]
    // );

    // useEffect(() => {
    //   const handleInput = (e: Event) => {
    //     const target = e.target as HTMLDivElement;
    //     // setMessage(target.innerHTML);
    //   };

    //   const handlePaste = (e: ClipboardEvent) => {
    //     e.preventDefault();
    //     const text = e.clipboardData?.getData("text/plain");
    //     document.execCommand("insertText", false, text);
    //   };

    //   const messageInput = ref.current;
    //   if (messageInput) {
    //     messageInput.addEventListener("input", handleInput);
    //     messageInput.addEventListener("paste", handlePaste);
    //   }

    //   return () => {
    //     if (messageInput) {
    //       messageInput.removeEventListener("input", handleInput);
    //       messageInput.removeEventListener("paste", handlePaste);
    //     }
    //   };
    // }, [setMessage]);

    // Media Handling
    const triggerFileSelect = useCallback(() => {
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      fileInput?.click();
    }, []);

    // const handleFileSelect = useCallback(
    //   (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const imageTypes = [
    //       "image/png",
    //       "image/jpeg",
    //       "image/jpg",
    //       "image/gif",
    //       "image/svg+xml",
    //       "image/webp",
    //       "image/bmp",
    //       "image/tiff",
    //       "image/ico",
    //     ];

    //     if (e.target.files) {
    //       const selectedFiles = Array.from(e.target.files);
    //       const validFiles = selectedFiles.filter(
    //         (file) =>
    //           imageTypes.includes(file.type) || file.type.startsWith("video/")
    //       );

    //       if (validFiles.length !== selectedFiles.length) {
    //         toast.error(
    //           "Invalid file type, please select an image or video file"
    //         );
    //         return;
    //       }

    //     //   addFiles(e.target.files);
    //     }
    //   },
    //   [addFiles]
    // );

    // Sync uploadedMediaData and uploadStatuses with mediaFiles
    // useEffect(() => {
    //   setUploadedMediaData((prev) => {
    //     const next: Record<string, Attachment> = {};
    //     // mediaFiles.forEach((file) => {
    //     //   if (prev[file.previewUrl]) {
    //     //     next[file.previewUrl] = prev[file.previewUrl];
    //     //   }
    //     // });
    //     return next;
    //   });

    //   setUploadStatuses((prev) => {
    //     const next: Record<
    //       string,
    //       "idle" | "uploading" | "completed" | "error"
    //     > = {};
    //     // mediaFiles.forEach((file) => {
    //     //   next[file.previewUrl] = prev[file.previewUrl] || "idle";
    //     // });
    //     return next;
    //   });
    // }, [mediaFiles]);

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
      <div className="bottom-0 lg:ml-4 lg:mr-2 relative max-h-max">
        <div className="flex flex-col w-full gap-2 border border-black/20 rounded-2xl px-2 dark:bg-gray-950 py-2 lg:rounded-xl">
          <div className="grid grid-cols-6 gap-2 text-white rounded-full">
            {/* MessageMediaPreview */}
          </div>
          <div className="flex items-center justify-between w-full gap-2">
            <div
              ref={ref as RefObject<HTMLDivElement>}
              contentEditable
              id="message-input"
              data-placeholder="Type your message..."
              //   onKeyDown={handleKeyDown}
              className="bg-transparent outline-none w-full p-2 rounded-xl border-black/20 dark:border-gray-600 font-semibold resize-none dark:text-white overflow-auto max-h-24"
            />
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              id="file-input"
              // onChange={handleFileSelect}
              multiple
            />
            <div className="flex gap-2 rounded-xl p-1.5">
              <span className="cursor-pointer" onClick={triggerFileSelect}>
                <LucidePlus stroke="#CC0DF8" size={25} />
              </span>
              <span className="cursor-pointer" onClick={triggerFileSelect}>
                <LucideCamera stroke="#CC0DF8" size={25} />
              </span>
              <span
              // className={`cursor-pointer ml-2 ${
              //   !allUploadsComplete ? "opacity-50 pointer-events-none" : ""
              // }`}
              // onClick={allUploadsComplete ? handleSendMessage : undefined}
              >
                <LucideSendHorizonal stroke="#CC0DF8" size={24} />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default MessageInputComponent;
