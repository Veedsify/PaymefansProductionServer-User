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
import axios from "axios";
import { useChatStore } from "@/contexts/ChatContext";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";
import { usePointsStore } from "@/contexts/PointsContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import { imageTypes, videoTypes } from "@/lib/FileTypes";
import type { MediaFile, Message, MessageInputProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import GenerateVideoPoster from "@/utils/GenerateVideoPoster";
import { getSocket } from "../../../components/common/Socket";
import MessageMediaPreview from "./MessageMediaPreview";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

interface MessageMediaFile {
  id: string;
  media_id: string;
  media_type: "image" | "video";
  media_state: "pending" | "uploading" | "processing" | "completed" | "failed";
  media_url: string;
  uploadProgress?: number;
  file?: File;
  posterUrl?: string;
}

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

    // Use local state for message media files instead of global mediaFiles
    const [messageMediaFiles, setMessageMediaFiles] = useState<
      MessageMediaFile[]
    >([]);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);

    // Socket connection monitoring
    const [isSocketConnected, setIsSocketConnected] = useState(
      socket?.connected || false
    );

    // Calculate upload progress
    const uploadProgress = useMemo(() => {
      if (messageMediaFiles.length === 0)
        return { completed: 0, total: 0, percentage: 0 };

      const completed = messageMediaFiles.filter(
        (f) => f.media_state === "completed"
      ).length;
      const total = messageMediaFiles.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percentage };
    }, [messageMediaFiles]);

    // Check if uploads are complete
    const areUploadsComplete = useMemo(() => {
      if (messageMediaFiles.length === 0) return true;
      return messageMediaFiles.every((f) => f.media_state === "completed");
    }, [messageMediaFiles]);

    // Check if any uploads have errors
    const hasUploadErrors = useMemo(() => {
      return messageMediaFiles.some((f) => f.media_state === "failed");
    }, [messageMediaFiles]);

    // Memoized values
    const canSendMessageMemo = useMemo(() => {
      const hasContent =
        message.trim().length > 0 || messageMediaFiles.length > 0;
      const uploadsComplete =
        messageMediaFiles.length === 0 || areUploadsComplete;
      const noUploadErrors = !hasUploadErrors;
      const socketReady = isSocketConnected && socket;
      return (
        hasContent &&
        uploadsComplete &&
        noUploadErrors &&
        socketReady &&
        !isSending &&
        !isBlockedByReceiver &&
        !isUploadingMedia
      );
    }, [
      message,
      messageMediaFiles,
      areUploadsComplete,
      hasUploadErrors,
      isSocketConnected,
      socket,
      isSending,
      isBlockedByReceiver,
      isUploadingMedia,
    ]);

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

    // S3 Upload Functions
    const getPresignedUrls = async (files: File[], mediaIds: string[]) => {
      const fileData = files.map((file, index) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        media_id: mediaIds[index],
      }));

      const response = await axiosInstance.post(
        "/conversations/presigned-urls",
        {
          files: fileData,
        }
      );

      return response.data.data;
    };

    const uploadToS3 = async (
      file: File,
      presignedUrl: string,
      media_id: string
    ) => {
      try {
        console.log(`🚀 Starting S3 upload for ${media_id}`, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });

        const response = await axios.put(presignedUrl, file, {
          headers: {
            "Content-Type": file.type,
          },
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total) {
              const progress =
                (progressEvent.loaded / progressEvent.total) * 100;
              console.log(
                `📊 Upload progress for ${media_id}: ${Math.round(progress)}%`
              );
              setMessageMediaFiles((prev) =>
                prev.map((m) =>
                  m.media_id === media_id
                    ? { ...m, uploadProgress: Math.round(progress) }
                    : m
                )
              );
            }
          },
        });

        console.log(`✅ S3 upload completed for ${media_id}`, response.status);
        return response;
      } catch (error: any) {
        console.error(`❌ S3 upload failed for ${media_id}:`, {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        throw error;
      }
    };

    const completeUpload = async (
      uploadedFiles: Array<{
        media_id: string;
        key: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        isVideo: boolean;
      }>
    ) => {
      const response = await axiosInstance.post(
        "/conversations/complete-upload",
        {
          uploadedFiles,
        }
      );

      return response.data.data;
    };

    // Upload pending files
    const uploadPendingFiles = async () => {
      const pendingFiles = messageMediaFiles.filter(
        (item) => item.media_state === "pending" && item.file
      );

      if (pendingFiles.length === 0) return;

      setIsUploadingMedia(true);

      try {
        console.log(`📤 Starting upload for ${pendingFiles.length} files`);

        // Step 1: Get presigned URLs
        const files = pendingFiles.map((item) => item.file!);
        const mediaIds = pendingFiles.map((item) => item.media_id);

        console.log("🔗 Requesting presigned URLs...", mediaIds);
        const presignedData = await getPresignedUrls(files, mediaIds);
        console.log("✅ Received presigned URLs:", presignedData.length);

        // Step 2: Mark files as uploading
        setMessageMediaFiles((prev) =>
          prev.map((item) =>
            pendingFiles.find((p) => p.media_id === item.media_id)
              ? { ...item, media_state: "uploading" }
              : item
          )
        );

        // Step 3: Upload files to S3 sequentially and save each one immediately
        console.log("⬆️ Uploading files to S3 sequentially...");
        let uploadCount = 0;
        for (const data of presignedData) {
          uploadCount++;
          const fileIndex = presignedData.indexOf(data);
          console.log(
            `⬆️ Uploading file ${uploadCount}/${presignedData.length}: ${data.media_id}`
          );

          // Upload to S3
          await uploadToS3(files[fileIndex], data.presignedUrl, data.media_id);
          console.log(
            `✅ File ${uploadCount}/${presignedData.length} uploaded: ${data.media_id}`
          );

          // Immediately save to database so processing can start
          console.log(`💾 Saving ${data.media_id} to database...`);
          const uploadedFile = [
            {
              media_id: data.media_id,
              key: data.key,
              fileName: data.fileName,
              fileType: data.fileType,
              fileSize: data.fileSize,
              isVideo: data.isVideo,
            },
          ];

          const [completedFile] = await completeUpload(uploadedFile);
          console.log(`✅ Database save complete for ${data.media_id}`);

          // Update this specific file's state immediately
          setMessageMediaFiles((prev) =>
            prev.map((item) => {
              if (item.media_id === data.media_id) {
                // Clean up blob URL
                if (item.media_url.startsWith("blob:")) {
                  URL.revokeObjectURL(item.media_url);
                }

                const finalState: MessageMediaFile["media_state"] =
                  completedFile.mimetype.startsWith("video/")
                    ? "processing"
                    : "completed";

                console.log(
                  `📝 Updated ${item.media_id} to state: ${finalState}`
                );

                return {
                  ...item,
                  media_url: completedFile.url,
                  media_state: finalState,
                  file: undefined,
                  uploadProgress: undefined,
                };
              }
              return item;
            })
          );
        }
        console.log("✅ All files uploaded and saved to database");
      } catch (error: any) {
        console.error("❌ Upload failed:", error);
        toast.error(`Upload failed: ${error.message || "Please try again."}`);

        // Mark failed uploads
        setMessageMediaFiles((prev) =>
          prev.map((item) =>
            pendingFiles.find((p) => p.media_id === item.media_id)
              ? { ...item, media_state: "failed" }
              : item
          )
        );
      } finally {
        setIsUploadingMedia(false);
      }
    };

    // Start upload when pending files are added
    useEffect(() => {
      const pendingFiles = messageMediaFiles.filter(
        (item) => item.media_state === "pending"
      );
      if (pendingFiles.length > 0 && !isUploadingMedia) {
        uploadPendingFiles();
      }
    }, [messageMediaFiles.length]);

    // SSE connection for video processing status
    useEffect(() => {
      if (!user?.id) return;

      console.log("🔌 Connecting to message media SSE...", user.id);

      const evtSource = new EventSource(
        process.env.NEXT_PUBLIC_TS_EXPRESS_URL +
          `/events/message-media-state?userId=${user?.id}`
      );

      evtSource.onopen = () => {
        console.log("✅ SSE connection established");
      };

      evtSource.addEventListener("ping", (event: MessageEvent) => {
        console.log("🏓 SSE ping received:", event.data);
      });

      evtSource.addEventListener(
        "message-processing-complete",
        (event: MessageEvent) => {
          console.log(
            "📥 SSE message-processing-complete received:",
            event.data
          );
          try {
            if (event.data) {
              const data = JSON.parse(event.data);
              console.log("✅ Updating media state for:", data.mediaId);

              // Check if media file exists and show toast outside setState
              setMessageMediaFiles((prev) => {
                const mediaFile = prev.find((m) => m.media_id === data.mediaId);

                // Only update if the media file exists in current state
                if (!mediaFile) {
                  console.log(
                    "⚠️ Media file not found in current state, ignoring event"
                  );
                  return prev;
                }

                // Schedule toast for next tick to avoid setState during render
                if (mediaFile.media_state === "processing") {
                  setTimeout(() => {
                    toast.success("Video processing completed!", {
                      id: "processing-complete",
                    });
                  }, 0);
                }

                const updated = prev.map((m) =>
                  m.media_id === data.mediaId
                    ? {
                        ...m,
                        media_state:
                          "completed" as MessageMediaFile["media_state"],
                      }
                    : m
                );
                console.log("📝 Media files after update:", updated);
                return updated;
              });
            }
          } catch (error) {
            console.error("❌ Error parsing SSE data:", error);
          }
        }
      );

      evtSource.onerror = (err) => {
        console.error("❌ SSE error:", err);
        console.log("🔄 SSE will attempt to reconnect automatically");
      };

      return () => {
        console.log("🔌 Closing SSE connection");
        evtSource.close();
      };
    }, [user?.id]);

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
          missingVars
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
      [debouncedSendTyping]
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
        if (messageMediaFiles.length > 0) {
          if (!areUploadsComplete) {
            toast.error(
              "Please wait for all uploads to complete before sending."
            );
            return;
          }

          if (hasUploadErrors) {
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

        // Get completed attachments
        const completedMedia = messageMediaFiles
          .filter((m) => m.media_state === "completed")
          .map((m) => ({
            url: m.media_url,
            type: m.media_type,
            id: m.media_id,
            name: m.media_id,
            poster: m.posterUrl || "",
            extension: m.file?.name.split(".").pop() || "",
            size: m.file?.size || 0,
          }));

        if (messageMediaFiles.length > 0 && completedMedia.length === 0) {
          toast.error("Upload failed. Please try uploading your files again.");
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
          attachment: completedMedia,
          triggerSend: true,
          created_at: new Date().toISOString(),
          seen: false,
        };

        // Optimistic update
        addNewMessage(newMessage);
        resetMessageInput();
        setMessageMediaFiles([]); // Clear message media files

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
              "Message is taking longer than expected. It may still be sent. Please wait before trying again."
            );
          } else {
            toast.error(
              "Failed to send message. Please check your connection and try again."
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
      messageMediaFiles,
      areUploadsComplete,
      hasUploadErrors,
      points,
      isFirstMessage,
      conversations,
      message,
      conversationId,
      addNewMessage,
      resetMessageInput,
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
      [typingHandler, message, handleSendMessage, setIsTyping]
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
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }, []);

    useEffect(() => {
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (!fileInput) return;

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

        // Immediately add files with preview URLs (synchronous part)
        const immediateMediaFiles: MessageMediaFile[] = validFiles.map(
          (file) => {
            const media_id = uuid();
            const previewUrl = URL.createObjectURL(file);
            const type: "image" | "video" = file.type.startsWith("video/")
              ? "video"
              : "image";

            return {
              id: uuid(),
              media_id,
              file,
              media_type: type,
              media_url: previewUrl,
              posterUrl: undefined, // Will be generated for videos after
              media_state: "pending",
              uploadProgress: 0,
            };
          }
        );

        // Add all files immediately to show previews
        setMessageMediaFiles((prev) => [...prev, ...immediateMediaFiles]);
        target.value = "";

        // Generate video posters asynchronously without blocking
        for (const mediaFile of immediateMediaFiles) {
          if (mediaFile.media_type === "video" && mediaFile.file) {
            try {
              const posterUrl = await GenerateVideoPoster(mediaFile.file);
              // Update the specific media file with poster
              setMessageMediaFiles((prev) =>
                prev.map((m) =>
                  m.media_id === mediaFile.media_id ? { ...m, posterUrl } : m
                )
              );
            } catch (error) {
              console.warn("Failed to generate video poster:", error);
            }
          }
        }
      };

      fileInput.addEventListener("change", handleFileChange);
      return () => fileInput.removeEventListener("change", handleFileChange);
    }, []);

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
        {messageMediaFiles.length > 0 && !areUploadsComplete && (
          <div className="p-2 mb-2 border border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/30 dark:border-purple-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700 dark:text-purple-300">
                {messageMediaFiles.some(
                  (f) =>
                    f.media_state === "processing" ||
                    (f.uploadProgress === 100 && f.media_state === "uploading")
                )
                  ? `Processing files... ${uploadProgress.completed}/${uploadProgress.total}`
                  : `Uploading files... ${uploadProgress.completed}/${uploadProgress.total}`}
              </span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {messageMediaFiles.some(
                  (f) =>
                    f.media_state === "processing" ||
                    (f.uploadProgress === 100 && f.media_state === "uploading")
                )
                  ? "Processing..."
                  : `${uploadProgress.percentage}%`}
              </span>
            </div>
            <div className="mt-1 w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  messageMediaFiles.some(
                    (f) =>
                      f.media_state === "processing" ||
                      (f.uploadProgress === 100 &&
                        f.media_state === "uploading")
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
            {messageMediaFiles.length > 0 && (
              <div className="p-0 text-white rounded-full grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {messageMediaFiles.map((file, index: number) => (
                  <MessageMediaPreview
                    key={file.id}
                    index={index}
                    file={{
                      id: file.id,
                      file: file.file!,
                      type: file.media_type,
                      previewUrl: file.media_url,
                      posterUrl: file.posterUrl,
                      uploadStatus:
                        file.media_state === "completed"
                          ? "completed"
                          : file.media_state === "failed"
                          ? "error"
                          : file.media_state === "processing"
                          ? "processing"
                          : file.media_state === "uploading"
                          ? "uploading"
                          : "idle",
                      uploadProgress: file.uploadProgress || 0,
                    }}
                    onRemove={(id) => {
                      setMessageMediaFiles((prev) => {
                        const fileToRemove = prev.find((f) => f.id === id);
                        // Clean up blob URL
                        if (fileToRemove?.media_url.startsWith("blob:")) {
                          URL.revokeObjectURL(fileToRemove.media_url);
                        }
                        return prev.filter((f) => f.id !== id);
                      });
                    }}
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
                        : messageMediaFiles.length > 0 && !areUploadsComplete
                        ? "Waiting for uploads to complete..."
                        : hasUploadErrors
                        ? "Some uploads failed. Please try again."
                        : "Please enter a message or add media"
                      : "Send message"
                  }
                >
                  {isSending ? (
                    <LoadingSpinner />
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
  }
);

MessageInputComponent.displayName = "MessageInputComponent";
export default MessageInputComponent;
