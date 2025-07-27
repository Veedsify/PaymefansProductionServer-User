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
import {
  LucidePlus,
  LucideCamera,
  LucideSendHorizonal,
  LucideX,
  LucideFile,
  LucideImage,
} from "lucide-react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { useUserStore } from "@/lib/UserUseContext";
import { useGroupChat } from "@/contexts/GroupChatContext";
import React from "react";
import { imageTypes } from "@/lib/FileTypes";
import Image from "next/image";
import { uploadGroupAttachment } from "@/utils/data/GroupAPI";

interface GroupData {
  id: string;
  name: string;
  description?: string;
  groupIcon?: string;
  groupType: string;
  maxMembers: number;
  membersCount: number;
  admin: {
    user_id: string;
    username: string;
    profile_image: string;
    is_verified: boolean;
  };
  settings: {
    allowMemberInvites: boolean;
    allowMediaSharing: boolean;
    allowFileSharing: boolean;
    moderateMessages: boolean;
    autoApproveJoinReqs: boolean;
  };
  userRole: "ADMIN" | "MODERATOR" | "MEMBER";
  isActive: boolean;
}

interface GroupAttachment {
  id: string;
  file: File;
  fileName: string;
  fileType: string;
  fileSize: number;
  preview?: string;
  uploadProgress?: number;
  isUploading?: boolean;
  uploadError?: string;
}

interface GroupMessageInputProps {
  groupId: string;
  groupData?: GroupData;
  disabled?: boolean;
  replyToMessage?: any;
  onCancelReply?: () => void;
}

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

const GroupMessageInputComponent = React.memo(
  ({
    groupId,
    groupData,
    disabled = false,
    replyToMessage,
    onCancelReply,
  }: GroupMessageInputProps) => {
    // Contexts and Hooks
    const user = useUserStore((state) => state.user);
    const { sendMessage, setTyping } = useGroupChat();
    const [message, setMessage] = useState<string>("");
    const [isSending, setIsSending] = useState(false);
    const [attachments, setAttachments] = useState<GroupAttachment[]>([]);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Media upload tracking
    const [areAllUploadsComplete, setAreAllUploadsComplete] = useState(true);

    const resetMessageInput = useCallback(() => {
      setMessage("");
      setAttachments([]);
      if (ref.current) {
        ref.current.innerHTML = "";
        ref.current.focus();
      }
    }, []);

    // Debounce typing indicator
    const debounce = <T extends (...args: any[]) => void>(
      func: T,
      wait: number,
    ) => {
      let timeout: NodeJS.Timeout | null = null;
      return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    const debouncedSendTyping = useCallback(() => {
      return debounce((message: string) => {
        setTyping(groupId, message.length > 0);
      }, 500);
    }, [groupId, setTyping]);

    // Handle file upload
    const uploadFile = async (file: File): Promise<string> => {
      // Update progress to show upload starting
      setAttachments((prev) =>
        prev.map((att) =>
          att.file === file
            ? { ...att, uploadProgress: 0, isUploading: true }
            : att,
        ),
      );

      try {
        const response = await uploadGroupAttachment([file]);

        // Update progress to complete
        setAttachments((prev) =>
          prev.map((att) =>
            att.file === file
              ? { ...att, uploadProgress: 100, isUploading: false }
              : att,
          ),
        );

        return response.data.attachments[0].fileUrl;
      } catch (error) {
        // Update with error
        setAttachments((prev) =>
          prev.map((att) =>
            att.file === file
              ? {
                  ...att,
                  uploadProgress: 0,
                  isUploading: false,
                  uploadError: "Upload failed",
                }
              : att,
          ),
        );
        throw error;
      }
    };

    const handleSendMessage = useCallback(async () => {
      if (
        !user ||
        !groupData ||
        (message.trim().length === 0 && attachments.length === 0) ||
        isSending ||
        disabled
      ) {
        return;
      }

      // Check group permissions
      if (!groupData.settings.allowMediaSharing && attachments.length > 0) {
        toast.error("Media sharing is not allowed in this group");
        return;
      }

      // Prevent sending if uploads are in progress
      if (attachments.length > 0 && !areAllUploadsComplete) {
        toast.error("Please wait for all uploads to complete.");
        return;
      }

      setIsSending(true);

      try {
        // Upload all attachments first
        const uploadedAttachments = [];

        for (const attachment of attachments) {
          if (!attachment.isUploading) {
            const fileUrl = await uploadFile(attachment.file);
            uploadedAttachments.push({
              fileName: attachment.fileName,
              fileUrl: fileUrl,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
            });
          }
        }

        // Send the message through socket
        const processedMessage = linkify(escapeHtml(message.trim()));

        sendMessage(
          groupId,
          processedMessage,
          uploadedAttachments,
          replyToMessage?.id,
        );

        // Reset form
        resetMessageInput();
        setTyping(groupId, false);
        onCancelReply?.();
        toast.success("Message sent!");
      } catch (error: any) {
        console.error("Error sending group message:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to send message";
        toast.error(errorMessage);
      } finally {
        setIsSending(false);
      }
    }, [
      user,
      groupData,
      message,
      attachments,
      isSending,
      disabled,
      areAllUploadsComplete,
      groupId,
      replyToMessage,
      sendMessage,
      resetMessageInput,
      setTyping,
      onCancelReply,
    ]);

    // Handle input change
    const handleInputChange = useCallback(() => {
      if (ref.current) {
        const content = ref.current.innerText || "";
        setMessage(content);
        const debouncedTyping = debouncedSendTyping();
        debouncedTyping(content);
      }
    }, [debouncedSendTyping]);

    // Handle key press
    const handleKeyPress = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      },
      [handleSendMessage],
    );

    // Handle file selection
    const handleFileSelect = useCallback(
      (files: FileList | null, type: "file" | "image") => {
        if (!files || files.length === 0) return;

        const newAttachments: GroupAttachment[] = [];

        Array.from(files).forEach((file) => {
          // Check file size (limit to 50MB)
          if (file.size > 50 * 1024 * 1024) {
            toast.error(
              `File ${file.name} is too large. Maximum size is 50MB.`,
            );
            return;
          }

          // Check group settings
          if (type === "image" && !groupData?.settings.allowMediaSharing) {
            toast.error("Media sharing is not allowed in this group");
            return;
          }

          if (type === "file" && !groupData?.settings.allowFileSharing) {
            toast.error("File sharing is not allowed in this group");
            return;
          }

          const attachment: GroupAttachment = {
            id: uuid(),
            file,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadProgress: 0,
            isUploading: false,
          };

          // Create preview for images
          if (imageTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setAttachments((prev) =>
                prev.map((att) =>
                  att.id === attachment.id
                    ? { ...att, preview: e.target?.result as string }
                    : att,
                ),
              );
            };
            reader.readAsDataURL(file);
          }

          newAttachments.push(attachment);
        });

        setAttachments((prev) => [...prev, ...newAttachments]);
        setShowAttachmentMenu(false);

        // Update upload completion status
        setAreAllUploadsComplete(false);
      },
      [groupData],
    );

    // Remove attachment
    const removeAttachment = useCallback((attachmentId: string) => {
      setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
    }, []);

    // Check if all uploads are complete
    useEffect(() => {
      const allComplete =
        attachments.length === 0 ||
        attachments.every((att) => !att.isUploading && !att.uploadError);
      setAreAllUploadsComplete(allComplete);
    }, [attachments]);

    // Focus input on mount
    useEffect(() => {
      if (ref.current && !disabled) {
        ref.current.focus();
      }
    }, [disabled]);

    if (disabled) {
      return (
        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You cannot send messages in this group
          </p>
        </div>
      );
    }

    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800">
        {/* Reply Preview */}
        {replyToMessage && (
          <div className="px-6 py-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Replying to {replyToMessage.sender.username}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 truncate">
                  {replyToMessage.content}
                </div>
              </div>
              <button
                onClick={onCancelReply}
                className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LucideX size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="px-6 py-3 border-t dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="relative">
                  {attachment.preview ? (
                    <div className="relative w-16 h-16">
                      <Image
                        src={attachment.preview}
                        alt={attachment.fileName}
                        fill
                        className="object-cover rounded"
                      />
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        <LucideX size={12} />
                      </button>
                      {attachment.isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                          <div className="text-white text-xs">
                            {attachment.uploadProgress}%
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border">
                      <LucideFile size={16} />
                      <span className="text-sm truncate max-w-[100px]">
                        {attachment.fileName}
                      </span>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <LucideX size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex w-full items-center gap-3 px-6 py-4">
          <div
            ref={ref}
            contentEditable={!isSending}
            onInput={handleInputChange}
            onKeyPress={handleKeyPress}
            className="bg-transparent outline-none w-full p-2 font-semibold resize-none dark:text-white min-h-[20px] max-h-[120px] overflow-y-auto"
            style={{ wordBreak: "break-word" }}
            data-placeholder="Type a message..."
          />

          {/* Attachment Menu */}
          <div className="relative">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="cursor-pointer p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              disabled={isSending}
            >
              <LucidePlus stroke="#CC0DF8" size={25} />
            </button>

            {showAttachmentMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                  disabled={!groupData?.settings.allowMediaSharing}
                >
                  <LucideImage size={16} />
                  <span className="text-sm">Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                  disabled={!groupData?.settings.allowFileSharing}
                >
                  <LucideFile size={16} />
                  <span className="text-sm">File</span>
                </button>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={
              isSending ||
              (message.trim().length === 0 && attachments.length === 0) ||
              !areAllUploadsComplete
            }
            className="cursor-pointer p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LucideSendHorizonal stroke="#CC0DF8" size={25} />
          </button>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files, "file")}
          />
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files, "image")}
          />
        </div>
      </div>
    );
  },
);

GroupMessageInputComponent.displayName = "GroupMessageInputComponent";

export default GroupMessageInputComponent;
