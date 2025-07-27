"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  LucideReply,
  LucideMoreVertical,
  LucideEdit,
  LucideTrash2,
  LucideFlag,
  LucideDownload,
  LucideEye,
  LucideVerified,
} from "lucide-react";
import { GroupMessage } from "@/contexts/GroupChatContext";
// Simple date formatting utility

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

interface GroupMessageBubbleProps {
  message: GroupMessage;
  isHighlighted: boolean;
  currentUserId: string;
  groupData?: GroupData;
  onReply?: (message: GroupMessage) => void;
  onEdit?: (message: GroupMessage) => void;
  onDelete?: (messageId: number) => void;
  onReport?: (messageId: number) => void;
}

const GroupMessageBubble: React.FC<GroupMessageBubbleProps> = ({
  message,
  isHighlighted,
  currentUserId,
  groupData,
  onReply,
  onEdit,
  onDelete,
  onReport,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);

  const isCurrentUser = message.senderId === currentUserId;
  const isAdmin = groupData?.userRole === "ADMIN";
  const isModerator = groupData?.userRole === "MODERATOR";
  const canModerate = isAdmin || isModerator;

  // Toggle dropdown visibility
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === message.id ? null : message.id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !(event.target as HTMLElement).closest(".option-button, .dropdown-menu")
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) {
        return "now";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return "Unknown time";
    }
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Render message content based on type
  const renderMessageContent = () => {
    const { content, messageType, attachments } = message;

    switch (messageType) {
      case "text":
        return (
          <div className="text-sm leading-tight">
            {content && (
              <div
                dangerouslySetInnerHTML={{
                  __html: content.replace(/\n/g, "<br>"),
                }}
              />
            )}
          </div>
        );

      case "image":
        return (
          <div className="space-y-2">
            {content && (
              <div className="text-sm leading-tight mb-2">{content}</div>
            )}
            {attachments.map((attachment, index) => (
              <div key={index} className="relative">
                <Image
                  src={attachment.fileUrl}
                  alt={attachment.fileName}
                  width={300}
                  height={200}
                  className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  onError={handleImageError}
                  onClick={() => window.open(attachment.fileUrl, "_blank")}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  <LucideEye size={12} className="inline mr-1" />
                  Click to view
                </div>
              </div>
            ))}
          </div>
        );

      case "video":
        return (
          <div className="space-y-2">
            {content && (
              <div className="text-sm leading-tight mb-2">{content}</div>
            )}
            {attachments.map((attachment, index) => (
              <div key={index} className="relative">
                <video
                  src={attachment.fileUrl}
                  controls
                  className="rounded-lg max-w-full h-auto"
                  style={{ maxHeight: "300px" }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
        );

      case "file":
        return (
          <div className="space-y-2">
            {content && (
              <div className="text-sm leading-tight mb-2">{content}</div>
            )}
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium truncate">
                    {attachment.fileName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <a
                  href={attachment.fileUrl}
                  download={attachment.fileName}
                  className="p-2 bg-primary-dark-pink text-white rounded-full hover:bg-opacity-90 transition-colors"
                >
                  <LucideDownload size={16} />
                </a>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-sm leading-tight">
            {content || "Unsupported message type"}
          </div>
        );
    }
  };

  return (
    <div
      className={`flex items-end gap-3 ${
        isCurrentUser ? "justify-end" : "justify-start"
      } ${isHighlighted ? "bg-yellow-100 dark:bg-yellow-900 bg-opacity-50 p-2 rounded-lg" : ""}`}
    >
      {/* Sender Avatar (for others' messages) */}
      {!isCurrentUser && (
        <Link href={`/@${message.sender.username}`}>
          <div className="relative">
            <Image
              width={40}
              height={40}
              src={
                imageError
                  ? "/site/avatar.png"
                  : message.sender.profile_image || "/site/avatar.png"
              }
              alt={message.sender.username}
              className="w-10 h-10 rounded-full object-cover"
              onError={handleImageError}
            />
            {message.sender.is_verified && (
              <div className="absolute -bottom-1 -right-1">
                <LucideVerified
                  size={16}
                  className="text-blue-500 bg-white rounded-full"
                />
              </div>
            )}
          </div>
        </Link>
      )}

      {/* Message Content */}
      <div
        className={`relative max-w-xs lg:max-w-md p-4 ${
          isCurrentUser
            ? "rounded-br-none bg-primary-dark-pink text-white"
            : "rounded-bl-none bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
        } rounded-2xl`}
      >
        {/* Sender name for group messages (except current user) */}
        {!isCurrentUser && (
          <div className="text-xs font-semibold mb-1 text-primary-dark-pink dark:text-primary-light">
            {message.sender.username}
            {message.sender.is_verified && (
              <LucideVerified size={12} className="inline ml-1 text-blue-500" />
            )}
          </div>
        )}

        {/* Reply indicator */}
        {message.replyTo && (
          <div className="mb-2 p-2 bg-black bg-opacity-10 rounded-lg border-l-2 border-gray-400">
            <div className="text-xs font-medium opacity-80">
              Replying to {message.replyTo.sender.username}
            </div>
            <div className="text-xs opacity-70 truncate">
              {message.replyTo.content}
            </div>
          </div>
        )}

        {/* Message Content */}
        {renderMessageContent()}

        {/* Message Footer */}
        <div className="flex justify-between items-center mt-2 text-xs opacity-80">
          <span>{formatMessageTime(message.createdAt)}</span>
          <div className="flex items-center gap-1">
            {/* Message actions */}
            <button
              className="option-button p-1 rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none transition-colors"
              onClick={toggleDropdown}
            >
              <LucideMoreVertical size={14} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {openDropdownId === message.id && (
          <div className="dropdown-menu absolute z-50 right-0 mt-1 w-40 rounded-lg shadow-lg bg-white dark:bg-gray-800 py-1 border border-gray-200 dark:border-gray-700">
            <ul className="text-sm">
              {/* Reply option */}
              <li
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                onClick={() => {
                  onReply?.(message);
                  setOpenDropdownId(null);
                }}
              >
                <LucideReply size={14} />
                Reply
              </li>

              {/* Edit option (only for current user) */}
              {isCurrentUser && (
                <li
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    onEdit?.(message);
                    setOpenDropdownId(null);
                  }}
                >
                  <LucideEdit size={14} />
                  Edit
                </li>
              )}

              {/* Delete option (for current user or moderators) */}
              {(isCurrentUser || canModerate) && (
                <li
                  className="px-3 py-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    onDelete?.(message.id);
                    setOpenDropdownId(null);
                  }}
                >
                  <LucideTrash2 size={14} />
                  Delete
                </li>
              )}

              {/* Report option (for others' messages) */}
              {!isCurrentUser && (
                <li
                  className="px-3 py-2 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900 cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    onReport?.(message.id);
                    setOpenDropdownId(null);
                  }}
                >
                  <LucideFlag size={14} />
                  Report
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Current User Avatar (for own messages) */}
      {isCurrentUser && (
        <Link href={`/@${message.sender.username}`}>
          <div className="relative">
            <Image
              width={40}
              height={40}
              src={
                imageError
                  ? "/site/avatar.png"
                  : message.sender.profile_image || "/site/avatar.png"
              }
              alt={message.sender.username}
              className="w-10 h-10 rounded-full object-cover"
              onError={handleImageError}
            />
            {message.sender.is_verified && (
              <div className="absolute -bottom-1 -right-1">
                <LucideVerified
                  size={16}
                  className="text-blue-500 bg-white rounded-full"
                />
              </div>
            )}
          </div>
        </Link>
      )}
    </div>
  );
};

export default GroupMessageBubble;
