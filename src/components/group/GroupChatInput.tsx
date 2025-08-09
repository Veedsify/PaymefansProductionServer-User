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
import {
  SendHorizonal as LucideSendHorizonal,
  Paperclip,
  X,
  File,
  Image as ImageIcon,
  Video,
  FileText,
} from "lucide-react";
import { useGroupChatStore } from "@/contexts/GroupChatContext";
import Image from "next/image";
import {
  validateFile,
  formatFileSize,
  isImage,
  createFilePreview,
  getFileInputAccept,
  truncateFilename,
  getFileCategory,
} from "@/utils/fileUtils";
import axiosInstance from "@/utils/Axios";
import toast from "react-hot-toast";

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

interface AttachmentPreview {
  file: File;
  id: string;
  preview?: string;
  uploadProgress?: number;
  uploaded?: boolean;
  uploadedData?: any;
}

interface GroupChatInputProps {
  isUserMuted?: boolean;
  mutedUntil?: string | null;
}

const GroupChatInput = ({
  isUserMuted = false,
  mutedUntil,
}: GroupChatInputProps) => {
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { sendMessage, setTypingStatus } = useGroupChatStore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check if user is currently muted
  // User is muted if:
  // 1. isMuted is true AND mutedUntil is null (permanent mute)
  // 2. isMuted is true AND mutedUntil is in the future (temporary mute)
  const isMuted =
    isUserMuted &&
    (!mutedUntil || // Permanent mute (mutedUntil is null)
      new Date(mutedUntil) > new Date()); // Temporary mute still active

  // Debug logging
  useEffect(() => {
    console.log("GroupChatInput - isUserMuted:", isUserMuted);
    console.log("GroupChatInput - mutedUntil:", mutedUntil);
    console.log("GroupChatInput - isMuted calculated:", isMuted);

    if (isUserMuted) {
      if (!mutedUntil) {
        console.log("User has permanent mute");
      } else {
        const muteExpiry = new Date(mutedUntil);
        const now = new Date();
        console.log("Mute expiry:", muteExpiry);
        console.log("Current time:", now);
        console.log("Is mute still active?", muteExpiry > now);
      }
    }
  }, [isUserMuted, mutedUntil, isMuted]);

  const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
    if (isMuted) return; // Don't handle typing if muted

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

  const uploadFile = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    const axios = require("axios");
    const formData = new FormData();
    formData.append("attachments", file);

    try {
      const response = await axiosInstance.post(
        `/groups/upload-attachment`,
        formData,
        {
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.lengthComputable && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              onProgress(progress);
            }
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (isMuted) return; // Don't allow file selection if muted

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter((file) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(`Sorry, please uplaod an image`);
        return false;
      }
      return true;
    });

    // Create previews for valid files
    const newAttachments: AttachmentPreview[] = validFiles.map((file) => {
      const id = Math.random().toString(36).substr(2, 9);
      const attachment: AttachmentPreview = { file, id };

      // Create preview for images
      if (isImage(file.type)) {
        createFilePreview(file)
          .then((preview) => {
            setAttachments((prev) =>
              prev.map((att) => (att.id === id ? { ...att, preview } : att))
            );
          })
          .catch((error) => {
            console.error("Failed to create preview:", error);
          });
      }

      return attachment;
    });

    setAttachments((prev) => [...prev, ...newAttachments]);

    // Auto-upload the new attachments
    handleAutoUpload(newAttachments);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const updateAttachmentProgress = (id: string, progress: number) => {
    setAttachments((prev) =>
      prev.map((att) =>
        att.id === id ? { ...att, uploadProgress: progress } : att
      )
    );
  };

  const markAttachmentUploaded = (id: string, uploadedData: any) => {
    setAttachments((prev) =>
      prev.map((att) =>
        att.id === id
          ? { ...att, uploaded: true, uploadedData, uploadProgress: 100 }
          : att
      )
    );
  };

  const getFileIcon = (fileType: string) => {
    const category = getFileCategory(fileType);
    switch (category) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Auto-upload files when selected
  const handleAutoUpload = async (newAttachments: AttachmentPreview[]) => {
    for (const attachment of newAttachments) {
      try {
        const uploadResult = await uploadFile(attachment.file, (progress) =>
          updateAttachmentProgress(attachment.id, progress)
        );
        markAttachmentUploaded(attachment.id, uploadResult);
      } catch (error) {
        console.error("Auto-upload failed:", error);
        // Mark as failed but keep the attachment for manual retry
        setAttachments((prev) =>
          prev.map((att) =>
            att.id === attachment.id ? { ...att, uploadProgress: 0 } : att
          )
        );
      }
    }
  };

  const sendIfValid = async () => {
    if (isMuted) {
      toast.error("You are muted and cannot send messages in this group.");
      return;
    }

    const trimmedMessage = messageContent.trim();
    if ((!trimmedMessage && attachments.length === 0) || sendingMessage) return;

    setSendingMessage(true);
    setUploadingFiles(true);

    try {
      // Clear typing timeout and status when sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTypingStatus(false);

      // Upload attachments if any (only upload non-uploaded ones)
      const uploadedAttachments = [];
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          try {
            let uploadResult;

            if (attachment.uploaded && attachment.uploadedData) {
              // Use already uploaded data
              uploadResult = attachment.uploadedData;
            } else {
              // Upload the file with progress tracking
              uploadResult = await uploadFile(attachment.file, (progress) =>
                updateAttachmentProgress(attachment.id, progress)
              );
              markAttachmentUploaded(attachment.id, uploadResult);
            }

            if (
              uploadResult.success &&
              uploadResult.data?.attachments?.length > 0
            ) {
              uploadedAttachments.push(...uploadResult.data.attachments);
            }
          } catch (error) {
            console.error("Failed to upload attachment:", error);
            alert(`Failed to upload ${attachment.file.name}`);
          }
        }
      }

      const processedMessage = trimmedMessage
        ? linkify(escapeHtml(trimmedMessage))
        : "";
      await sendMessage(processedMessage, uploadedAttachments);

      // Clear form
      setMessageContent("");
      setAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
      setUploadingFiles(false);
    }
  };

  const handleSendClick = (
    e: KeyboardEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>
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
    <div className="p-6 space-y-3 dark:bg-gray-800">
      {/* Muted Status Indicator */}
      {isMuted && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 text-red-500">🔇</div>
            <div>
              <p className="text-sm font-medium text-red-800">
                You are muted in this group
              </p>
              {mutedUntil && (
                <p className="text-xs text-red-600">
                  Muted until: {new Date(mutedUntil).toLocaleString()}
                </p>
              )}
              {!mutedUntil && (
                <p className="text-xs text-red-600">
                  You cannot send messages or attach files.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative flex items-center p-2 bg-white rounded-lg shadow-sm dark:bg-gray-600 min-w-0 max-w-48"
            >
              {attachment.preview ? (
                <Image
                  src={attachment.preview}
                  alt={attachment.file.name}
                  width={40}
                  height={40}
                  className="object-cover w-10 h-10 rounded"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded dark:bg-gray-500">
                  {getFileIcon(attachment.file.type)}
                </div>
              )}

              <div className="flex-1 ml-2 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {truncateFilename(attachment.file.name)}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.file.size)}
                  </p>
                  {attachment.uploadProgress !== undefined &&
                    !attachment.uploaded && (
                      <p className="text-xs text-blue-500">
                        {attachment.uploadProgress}%
                      </p>
                    )}
                  {attachment.uploaded && (
                    <p className="text-xs text-green-500">✓</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeAttachment(attachment.id)}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                type="button"
                aria-label="Remove attachment"
                disabled={
                  attachment.uploadProgress !== undefined &&
                  !attachment.uploaded
                }
              >
                <X className="w-3 h-3" />
              </button>

              {/* Upload progress bar */}
              {attachment.uploadProgress !== undefined &&
                !attachment.uploaded && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-b">
                    <div
                      className="h-full bg-blue-500 rounded-b transition-all duration-300"
                      style={{ width: `${attachment.uploadProgress}%` }}
                    />
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end space-x-2">
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept={getFileInputAccept()}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sendingMessage || uploadingFiles || isMuted}
              className="p-3 text-gray-500 hover:text-primary-dark-pink hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              aria-label={
                isMuted
                  ? "File attachments disabled - you are muted"
                  : "Attach file"
              }
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              value={messageContent}
              disabled={uploadingFiles || isMuted}
              className="flex-grow px-4 py-4 border border-gray-300 resize-none rounded-md focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              placeholder={
                isMuted
                  ? "You are muted and cannot send messages..."
                  : uploadingFiles
                  ? "Uploading files..."
                  : "Type a message..."
              }
            />
          </div>
        </div>

        <button
          disabled={sendingMessage || uploadingFiles || isMuted}
          onClick={handleSendClick}
          className="px-4 py-4 text-white cursor-pointer bg-primary-dark-pink rounded-md hover:bg-primary-text-dark-pink disabled:bg-gray-500 flex-shrink-0"
          aria-label={isMuted ? "Cannot send - you are muted" : "Send message"}
          type="button"
        >
          {sendingMessage || uploadingFiles ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <LucideSendHorizonal className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default GroupChatInput;
