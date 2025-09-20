"use client";
import {
  LucideCamera,
  LucideLoader,
  LucidePlus,
  LucideSendHorizonal,
} from "lucide-react";
import React, {
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { v4 as uuid } from "uuid";
import { useChatStore } from "@/contexts/ChatContext";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";
import { usePointsStore } from "@/contexts/PointsContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { imageTypes } from "@/lib/FileTypes";
import type { MediaFile, Message, MessageInputProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import GenerateVideoPoster from "@/utils/GenerateVideoPoster";
import { getSocket } from "../../../components/common/Socket";
import MessageMediaPreview from "./MessageMediaPreview";

// Utility Functions (memoized)
const escapeHtml = (str: string) => {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "<",
    ">": ">",
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
  ({
    receiver,
    isFirstMessage,
    conversationId,
    isBlockedByReceiver = false,
  }: MessageInputProps) => {
    // Contexts and Hooks
    const { user } = useAuthContext();
    const points = usePointsStore((state) => state.points);
    const { conversations } = useMessagesConversation();
    const [message, setMessage] = useState<string>("");
    const [isSending, setIsSending] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const setIsTyping = useChatStore((state) => state.setIsTyping);
    const socket = getSocket();
    const addNewMessage = useChatStore((state) => state.addNewMessage);
    const mediaFiles = useChatStore((state) => state.mediaFiles);
    const setMediaFiles = useChatStore((state) => state.setMediaFiles);
    const resetAllMedia = useChatStore((state) => state.resetAllMedia);

    // Socket connection monitoring
    const [isSocketConnected, setIsSocketConnected] = useState(
      socket?.connected || false,
    );

    // Memoized values
    const canSendMessageMemo = useMemo(() => {
      const hasContent = message.trim().length > 0 || mediaFiles.length > 0;
      const uploadsComplete =
        mediaFiles.length === 0 ||
        mediaFiles.every((f) => f.uploadStatus === "completed");
      const noUploadErrors = mediaFiles.every(
        (f) => f.uploadStatus !== "error",
      );
      const socketReady = isSocketConnected && socket;
      return (
        hasContent &&
        uploadsComplete &&
        noUploadErrors &&
        socketReady &&
        !isSending &&
        !isBlockedByReceiver
      );
    }, [
      message,
      mediaFiles,
      isSocketConnected,
      socket,
      isSending,
      isBlockedByReceiver,
    ]);

    const uploadProgress = useMemo(() => {
      if (mediaFiles.length === 0)
        return { completed: 0, total: 0, percentage: 0 };

      const completed = mediaFiles.filter(
        (f) => f.uploadStatus === "completed",
      ).length;
      const total = mediaFiles.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percentage };
    }, [mediaFiles]);

    useEffect(() => {
      if (!socket) return;

      const handleConnect = () => setIsSocketConnected(true);
      const handleDisconnect = () => setIsSocketConnected(false);
      const handleConnectError = () => setIsSocketConnected(false);

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);
      };
    }, [socket]);

    // Media upload hook
    const { areAllUploadsComplete, hasUploadErrors, getCompletedAttachments } =
      useMediaUpload();

    // Validate environment variables on mount
    useEffect(() => {
      const requiredEnvVars = {
        NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN:
          process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN,
      };
      const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([name]) => name);
      if (missingVars.length > 0) {
        console.error(
          "❌ Missing required environment variables:",
          missingVars,
        );
        console.warn("⚠️ Video uploads may fail due to missing configuration");
      }
    }, []);

    const resetMessageInput = useCallback(() => {
      setMessage("");
      if (ref.current) {
        ref.current.innerHTML = "";
        ref.current.focus();
      }
    }, []);

    // Debounce typing indicator
    const debouncedSendTyping = useCallback(() => {
      let timeout: NodeJS.Timeout | null = null;
      return (message: string) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          setIsTyping(message.length > 0);
        }, 500);
      };
    }, [setIsTyping]);

    const typingHandler = useMemo(
      () => debouncedSendTyping(),
      [debouncedSendTyping],
    );

    // Helper function to ensure socket connection
    const ensureSocketConnection = useCallback(async (): Promise<boolean> => {
      if (!socket) return false;
      if (socket.connected) return true;

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          socket.off("connect", handleConnect);
          resolve(false);
        }, 5000);

        const handleConnect = () => {
          clearTimeout(timeout);
          socket.off("connect", handleConnect);
          resolve(true);
        };

        socket.on("connect", handleConnect);
        socket.connect();
      });
    }, [socket]);

    const handleSendMessage = useCallback(async () => {
      if (
        !user ||
        !receiver ||
        isSending ||
        isBlockedByReceiver ||
        !canSendMessageMemo
      ) {
        return;
      }

      setIsSending(true);

      try {
        // Check uploads before proceeding
        if (mediaFiles.length > 0) {
          if (!areAllUploadsComplete()) {
            toast.error(
              "Please wait for all uploads to complete before sending.",
            );
            return;
          }

          if (hasUploadErrors()) {
            toast.error("Some files failed to upload. Please try again.");
            return;
          }
        }

        // Points check
        const { data } = await axiosInstance.post("/points/price-per-message", {
          user_id: receiver.user_id,
        });

        const pricePerMessage = data.price_per_message;
        const receiverName =
          receiver.name.charAt(0).toUpperCase() + receiver.name.slice(1);

        // if (points < pricePerMessage && !user.admin) {
        //   resetMessageInput();
        //   return swal({
        //     icon: "info",
        //     title: "Insufficient Paypoints",
        //     text: `You have ${points} points but need ${pricePerMessage.toLocaleString()} paypoints to send a message to ${receiverName}`,
        //   });
        // }

        // First message confirmation
        if (isFirstMessage) {
          const isToSend = await swal({
            icon: "info",
            title: "Notice from PayMeFans",
            text: `Your first message to ${receiverName} costs ${pricePerMessage} paypoints`,
            dangerMode: true,
            buttons: ["Cancel", "Continue"],
          });
          if (!isToSend) return;
        }

        // Conversation message confirmation
        if (!conversations[0]?.lastMessage && pricePerMessage !== 0) {
          const isToSend = await swal({
            icon: "info",
            title: "Notice from PayMeFans",
            text: `Sending a message to ${receiverName} costs ${pricePerMessage.toLocaleString()} paypoints`,
          });
          if (!isToSend) return;
        }

        // Validate attachments
        const attachments = getCompletedAttachments();
        if (mediaFiles.length > 0 && attachments.length === 0) {
          toast.error("Upload failed. Please try uploading your files again.");
          return;
        }

        const invalidAttachments = attachments.filter(
          (att) => !att.url || !att.id || !att.type,
        );
        if (invalidAttachments.length > 0) {
          toast.error(
            "Some files failed to upload properly. Please try again.",
          );
          return;
        }

        // Create message
        const messageText = linkify(escapeHtml(message));
        const newMessage: Message = {
          id: Math.random(),
          message_id: uuid(),
          sender_id: user?.user_id as string,
          receiver_id: receiver.user_id,
          conversationId: conversationId,
          message: messageText,
          attachment: attachments,
          rawFiles: mediaFiles,
          triggerSend: true,
          created_at: new Date().toISOString(),
          seen: false,
        };

        // Optimistic update
        addNewMessage(newMessage);
        resetMessageInput();
        resetAllMedia();

        // Ensure socket connection
        if (!socket?.connected) {
          socket?.connect();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (!socket?.connected) {
            toast.error("Connection lost. Please refresh and try again.");
            return;
          }
        }

        // Emit message with timeout
        try {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Message send timeout"));
            }, 10000);

            socket!.emit("new-message", newMessage, (response?: any) => {
              clearTimeout(timeout);
              if (response?.error) {
                reject(new Error(response.error));
              } else {
                resolve(response);
              }
            });

            // Fallback timeout
            setTimeout(() => {
              clearTimeout(timeout);
              resolve(null);
            }, 300);
          });
        } catch (socketError: any) {
          if (socketError.message === "Message send timeout") {
            toast.error(
              "Message is taking longer than expected. It may still be sent. Please wait before trying again.",
            );
          } else {
            toast.error(
              "Failed to send message. Please check your connection and try again.",
            );
          }
        }
      } catch (error: any) {
        console.error("Error sending message:", error);
        if (error?.response?.data?.error === "INSUFFICIENT_POINTS") {
          swal({
            icon: "info",
            title: "Insufficient Paypoints",
            text:
              error.response.data.message ||
              `You don't have enough points to send this message`,
          });
        } else {
          toast.error("Failed to send message");
        }
      } finally {
        setIsSending(false);
      }
    }, [
      user,
      receiver,
      isSending,
      isBlockedByReceiver,
      canSendMessageMemo,
      mediaFiles,
      areAllUploadsComplete,
      hasUploadErrors,
      getCompletedAttachments,
      points,
      isFirstMessage,
      conversations,
      message,
      conversationId,
      addNewMessage,
      resetMessageInput,
      resetAllMedia,
      socket,
    ]);

    // Typing and Input Handling
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        typingHandler(message);
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          setIsTyping(false);
          handleSendMessage();
        }
      },
      [typingHandler, message, handleSendMessage, setIsTyping],
    );

    useEffect(() => {
      const messageInput = ref.current;
      if (!messageInput) return;

      const handleInput = (e: Event) => {
        const target = e.target as HTMLDivElement;
        setMessage(target.innerHTML);
      };

      const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") || "";
        document.execCommand("insertText", false, text);
      };

      messageInput.addEventListener("input", handleInput);
      messageInput.addEventListener("paste", handlePaste);

      return () => {
        messageInput.removeEventListener("input", handleInput);
        messageInput.removeEventListener("paste", handlePaste);
      };
    }, []);

    // Media Handling
    const triggerFileSelect = useCallback(() => {
      const fileInput = document.getElementById(
        "file-input",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }, []);

    useEffect(() => {
      const fileInput = document.getElementById(
        "file-input",
      ) as HTMLInputElement;
      if (!fileInput) return;

      const handleFileChange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const files = target.files;
        if (!files || files.length === 0) return;

        const selectedFiles = Array.from(files);
        const validFiles = selectedFiles.filter(
          (file) =>
            imageTypes.includes(file.type) || file.type.startsWith("video/"),
        );

        if (validFiles.length !== selectedFiles.length) {
          toast.error(
            "Invalid file type, please select an image or video file",
          );
          return;
        }

        const newMediaFiles: MediaFile[] = [];
        for (const file of validFiles) {
          const previewUrl = URL.createObjectURL(file);
          const type: "image" | "video" = file.type.startsWith("video/")
            ? "video"
            : "image";

          let posterUrl: string | undefined;
          if (type === "video") {
            try {
              posterUrl = await GenerateVideoPoster(file);
            } catch (error) {
              console.warn("Failed to generate video poster:", error);
            }
          }

          newMediaFiles.push({
            id: uuid(),
            file,
            type,
            previewUrl,
            posterUrl,
            uploadStatus: "idle",
            uploadProgress: 0,
          });
        }

        setMediaFiles && setMediaFiles(newMediaFiles);
        target.value = "";
      };

      fileInput.addEventListener("change", handleFileChange);
      return () => fileInput.removeEventListener("change", handleFileChange);
    }, [setMediaFiles]);

    // Early returns
    if (receiver?.is_profile_hidden) {
      return (
        <div className="flex items-center justify-center h-full py-3 text-center space-y-2">
          <p className="text-gray-500 dark:text-white">
            You cannot send messages to this account.
          </p>
        </div>
      );
    }

    if (receiver && !receiver.active_status) {
      return (
        <div className="flex items-center justify-center h-full py-4 text-center space-y-2">
          <p className="text-gray-500 dark:text-white">
            {receiver.name} is currently suspended.
          </p>
        </div>
      );
    }

    return (
      <div className="relative bottom-0 lg:ml-4 lg:mr-2 max-h-max">
        {mediaFiles.length > 0 && !areAllUploadsComplete() && (
          <div className="p-2 mb-2 border border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/30 dark:border-purple-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700 dark:text-purple-300">
                {mediaFiles.some(
                  (f) =>
                    f.uploadProgress === 99 ||
                    (f.uploadProgress === 100 && !f.attachment),
                )
                  ? `Processing files... ${uploadProgress.completed}/${uploadProgress.total}`
                  : `Uploading files... ${uploadProgress.completed}/${uploadProgress.total}`}
              </span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {mediaFiles.some(
                  (f) =>
                    f.uploadProgress === 99 ||
                    (f.uploadProgress === 100 && !f.attachment),
                )
                  ? "Processing..."
                  : `${uploadProgress.percentage}%`}
              </span>
            </div>
            <div className="mt-1 w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  mediaFiles.some(
                    (f) =>
                      f.uploadProgress === 99 ||
                      (f.uploadProgress === 100 && !f.attachment),
                  )
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-purple-600 dark:bg-purple-400"
                }`}
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {isBlockedByReceiver ? (
          <div className="p-4 bg-gray-100 border border-gray-300 dark:bg-gray-800 rounded-xl dark:border-gray-600">
            <div className="flex items-center justify-center text-gray-500 gap-2 dark:text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <span className="text-sm font-medium">
                You can&apos;t send messages to this user
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full px-2 py-2 border gap-2 border-black/20 rounded-2xl dark:bg-gray-900 lg:rounded-xl">
            {mediaFiles.length > 0 && (
              <div className="p-0 text-white rounded-full grid grid-cols-6 gap-2">
                {mediaFiles.map((file: MediaFile, index: number) => (
                  <MessageMediaPreview
                    key={file.id}
                    index={index}
                    file={file}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center justify-between w-full gap-2">
              <div
                ref={ref as RefObject<HTMLDivElement>}
                contentEditable
                id="message-input"
                data-placeholder="Type your message..."
                onKeyDown={handleKeyDown}
                className="w-full p-2 overflow-auto font-semibold bg-transparent outline-none resize-none rounded-xl border-black/20 dark:border-gray-600 dark:text-white max-h-24"
              />
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                id="file-input"
                multiple
              />
              <div className="flex gap-2 rounded-xl p-1.5">
                <span
                  className={`cursor-pointer ${
                    isSending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={isSending ? undefined : triggerFileSelect}
                >
                  <LucidePlus stroke="#CC0DF8" size={25} />
                </span>
                <span
                  className={`cursor-pointer ${
                    isSending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={isSending ? undefined : triggerFileSelect}
                >
                  <LucideCamera stroke="#CC0DF8" size={25} />
                </span>
                <button
                  onClick={handleSendMessage}
                  className={`cursor-pointer transition-opacity ${
                    !canSendMessageMemo
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-80"
                  }`}
                  disabled={!canSendMessageMemo}
                  title={
                    !canSendMessageMemo
                      ? !isSocketConnected
                        ? "Connection lost - please refresh the page"
                        : isSending
                          ? "Sending message..."
                          : mediaFiles.length > 0 && !areAllUploadsComplete()
                            ? "Waiting for uploads to complete..."
                            : hasUploadErrors()
                              ? "Some uploads failed. Please try again."
                              : "Please enter a message or add media"
                      : "Send message"
                  }
                >
                  {isSending ? (
                    <LucideLoader className="w-6 h-6 border-pink-500 rounded-full animate-spin" />
                  ) : (
                    <LucideSendHorizonal
                      stroke={!canSendMessageMemo ? "#9CA3AF" : "#CC0DF8"}
                      size={24}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

MessageInputComponent.displayName = "MessageInputComponent";
export default MessageInputComponent;
