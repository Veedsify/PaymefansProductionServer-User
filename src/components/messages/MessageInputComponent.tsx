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
import { LucidePlus, LucideCamera, LucideSendHorizonal } from "lucide-react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";
import {
  MessageInputProps,
  Attachment,
  MediaFile,
  Message,
} from "@/types/Components";
import MessageMediaPreview from "./MessageMediaPreview";
import React from "react";
import { useChatStore } from "@/contexts/ChatContext";
import { usePointsStore } from "@/contexts/PointsContext";
import { getSocket } from "../sub_components/sub/Socket";
import GenerateVideoPoster from "@/utils/GenerateVideoPoster";
import { imageTypes } from "@/lib/FileTypes";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { monitorUploadStatus } from "@/utils/DebugVideoUpload";

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
  ({ receiver, isFirstMessage, conversationId }: MessageInputProps) => {
    // Contexts and Hooks
    const { user } = useUserAuthContext();
    const points = usePointsStore((state) => state.points);
    const { conversations } = useMessagesConversation();
    const [message, setMessage] = useState<string>("");
    const [isSending, setIsSending] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const setIsTyping = useChatStore((state) => state.setIsTyping);
    const token = getToken();
    const socket = getSocket();
    const addNewMessage = useChatStore((state) => state.addNewMessage);
    const mediaFiles = useChatStore((state) => state.mediaFiles);
    const setMediaFiles = useChatStore((state) => state.setMediaFiles);
    const resetAllMedia = useChatStore((state) => state.resetAllMedia);

    // Media upload hook
    const {
      areAllUploadsComplete,
      hasUploadErrors,
      getCompletedAttachments,
      getUploadProgress,
    } = useMediaUpload();

    // Debug monitoring for uploads
    useEffect(() => {
      if (mediaFiles.length > 0) {
        const cleanup = monitorUploadStatus(mediaFiles, 2000);
        return cleanup;
      }
    }, [mediaFiles]);

    const resetMessageInput = useCallback(() => {
      setMessage("");
      if (ref.current) {
        ref.current.innerHTML = "";
        ref.current.focus();
      }
    }, [setMessage]);

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

    const debouncedSendTyping = useCallback(() => {
      return debounce((message: string) => {
        if (message.length > 0) {
          setIsTyping(true);
        } else {
          setIsTyping(false);
        }
      }, 500);
    }, [setIsTyping]);

    const handleSendMessage = useCallback(async () => {
      if (
        !user ||
        !receiver ||
        (message.trim().length === 0 && mediaFiles.length === 0) ||
        isSending
      ) {
        return;
      }

      // Prevent sending if uploads are in progress
      if (mediaFiles.length > 0 && !areAllUploadsComplete()) {
        // Optionally, show a toast or message to the user
        console.warn("Please wait for all uploads to complete.");
        return;
      }

      setIsSending(true);

      try {
        const { data } = await axiosInstance.post(
          "/points/price-per-message",
          { user_id: receiver.user_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pricePerMessage = data.price_per_message;
        const receiverName =
          receiver.name.charAt(0).toUpperCase() + receiver.name.slice(1);

        if (points < pricePerMessage && !user.admin) {
          resetMessageInput();
          return swal({
            icon: "info",
            title: "Insufficient Paypoints",
            text: `You have ${points} points but need ${pricePerMessage.toLocaleString()} paypoints to send a message to ${receiverName}`,
          });
        }
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
        if (!conversations[0]?.lastMessage && pricePerMessage !== 0) {
          const isToSend = await swal({
            icon: "info",
            title: "Notice from PayMeFans",
            text: `Sending a message to ${receiverName} costs ${pricePerMessage.toLocaleString()} paypoints`,
          });
          if (!isToSend) return;
        }

        // Wait for all uploads to complete before proceeding
        if (mediaFiles.length > 0) {
          console.log("⏳ Waiting for uploads to complete...");
          console.log("📊 Current upload status:", {
            totalFiles: mediaFiles.length,
            allComplete: areAllUploadsComplete(),
            hasErrors: hasUploadErrors(),
            fileStatuses: mediaFiles.map((f) => ({
              id: f.id,
              status: f.uploadStatus,
              progress: f.uploadProgress,
              type: f.type,
            })),
          });

          // Wait for all uploads to complete with proper polling
          let maxWaitTime = 60000; // 60 seconds max wait
          let waitTime = 0;
          const pollInterval = 500; // Check every 500ms

          while (!areAllUploadsComplete() && waitTime < maxWaitTime) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            waitTime += pollInterval;

            // Log progress every 5 seconds
            if (waitTime % 5000 === 0) {
              console.log(`⏳ Still waiting... ${waitTime / 1000}s elapsed`, {
                allComplete: areAllUploadsComplete(),
                fileStatuses: mediaFiles.map((f) => ({
                  id: f.id,
                  progress: f.uploadProgress,
                  status: f.uploadStatus,
                })),
              });
            }
          }

          // Final check - if still not complete after max wait time, show error
          if (!areAllUploadsComplete()) {
            console.error(
              "❌ Upload timeout - not all files completed uploading"
            );
            console.error("📊 Final status:", {
              fileStatuses: mediaFiles.map((f) => ({
                id: f.id,
                status: f.uploadStatus,
                progress: f.uploadProgress,
              })),
            });
            toast.error("Upload failed. Please try again.");
            return;
          }

          // Check for upload errors
          if (hasUploadErrors()) {
            console.error("❌ Upload errors detected");
            toast.error("Some files failed to upload. Please try again.");
            return;
          }

          console.log("✅ All uploads completed successfully!");
        }

        console.log(
          "✅ All upload checks passed, getting completed attachments"
        );
        const attachments = getCompletedAttachments();
        console.log("📎 Completed attachments:", attachments);

        const newMessage: Message = {
          id: Math.random(),
          message_id: uuid(),
          sender_id: user.user_id,
          receiver_id: receiver.user_id,
          conversationId: conversationId,
          message: linkify(escapeHtml(message)),
          attachment: attachments,
          rawFiles: mediaFiles,
          triggerSend: true,
          created_at: new Date().toISOString(),
          seen: false,
        };

        // Add the new message to the chat store immediately for optimistic UI
        addNewMessage(newMessage);

        // Reset input and media
        resetMessageInput();
        resetAllMedia();

        // Emit to socket
        console.log("🚀 Emitting message to socket:", {
          message_id: newMessage.message_id,
          hasAttachments: attachments.length > 0,
        });
        socket.emit("new-message", newMessage);
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
      conversationId,
      socket,
      resetMessageInput,
      resetAllMedia,
      user,
      receiver,
      points,
      addNewMessage,
      conversations,
      message,
      isFirstMessage,
      token,
      mediaFiles,
      areAllUploadsComplete,
      hasUploadErrors,
      getCompletedAttachments,
      isSending,
    ]);

    // Typing and Input Handling
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        debouncedSendTyping();
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          setIsTyping(false);
          handleSendMessage();
        }
      },
      [debouncedSendTyping, handleSendMessage, setIsTyping]
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
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      fileInput?.click();

      // Remove any existing event listeners to prevent duplicates
      const handleFileChange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const files = target.files;

        if (!files || files.length === 0) return;

        const selectedFiles = Array.from(files);
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

        await Promise.all(
          validFiles.map(async (file) => {
            const previewUrl = URL.createObjectURL(file);
            const type: "image" | "video" = file.type.startsWith("video/")
              ? "video"
              : "image";

            let posterUrl: string | undefined;

            // Generate poster/thumbnail for videos
            if (type === "video") {
              try {
                posterUrl = await GenerateVideoPoster(file);
              } catch (error) {
                console.warn("Failed to generate video poster:", error);
              }
            }

            const mediafile: MediaFile = {
              id: uuid(),
              file,
              type,
              previewUrl,
              posterUrl,
              uploadStatus: "idle",
              uploadProgress: 0,
            };

            if (setMediaFiles) {
              setMediaFiles(mediafile);
            }
            return mediafile;
          })
        );

        // Clean up: reset the input value so the same file can be selected again
        target.value = "";
        // Remove the event listener after handling
        fileInput.removeEventListener("change", handleFileChange);
      };

      fileInput.addEventListener("change", handleFileChange);
    }, [setMediaFiles]);

    if (receiver && receiver.isProfileHidden) {
      return (
        <div className="flex items-center justify-center h-full py-3 space-y-2 text-center">
          <p className="text-gray-500 dark:text-white">
            You cannot send messages to this account.
          </p>
        </div>
      );
    }

    if (receiver && !receiver.active_status) {
      return (
        <div className="flex items-center justify-center h-full py-4 space-y-2 text-center">
          <p className="text-gray-500 dark:text-white">
            {receiver.name} is currently suspended.
          </p>
        </div>
      );
    }

    const uploadProgress = getUploadProgress();

    return (
      <div className="bottom-0 lg:ml-4 lg:mr-2 relative max-h-max">
        {mediaFiles.length > 0 && !areAllUploadsComplete() && (
          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 dark:text-blue-300">
                {mediaFiles.some((f) => f.uploadProgress === 99)
                  ? `Processing files... ${uploadProgress.completed}/${uploadProgress.total}`
                  : `Uploading files... ${uploadProgress.completed}/${uploadProgress.total}`}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {mediaFiles.some((f) => f.uploadProgress === 99)
                  ? "Processing..."
                  : `${uploadProgress.percentage}%`}
              </span>
            </div>
            <div className="mt-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  mediaFiles.some((f) => f.uploadProgress === 99)
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-blue-600 dark:bg-blue-400"
                }`}
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col w-full gap-2 border border-black/20 rounded-2xl px-2 dark:bg-gray-900 py-2 lg:rounded-xl">
          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-6 p-0 gap-2 text-white rounded-full">
              {mediaFiles.map((file: MediaFile, index: number) => (
                <MessageMediaPreview key={index} index={index} file={file} />
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
              className="bg-transparent outline-none w-full p-2 rounded-xl border-black/20 dark:border-gray-600 font-semibold resize-none dark:text-white overflow-auto max-h-24"
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
                className={`cursor-pointer ${
                  (mediaFiles.length > 0 && !areAllUploadsComplete()) ||
                  isSending
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  (mediaFiles.length > 0 && !areAllUploadsComplete()) ||
                  isSending
                }
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                ) : (
                  <LucideSendHorizonal
                    stroke={
                      (mediaFiles.length > 0 && !areAllUploadsComplete()) ||
                      isSending
                        ? "#9CA3AF"
                        : "#CC0DF8"
                    }
                    size={24}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MessageInputComponent.displayName = "MessageInputComponent";

export default MessageInputComponent;
