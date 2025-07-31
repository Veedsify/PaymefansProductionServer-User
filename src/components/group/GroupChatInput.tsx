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
import React from "react";
import { useChatStore } from "@/contexts/ChatContext";
import { usePointsStore } from "@/contexts/PointsContext";
import { getSocket } from "../sub_components/sub/Socket";
import GenerateVideoPoster from "@/utils/GenerateVideoPoster";
import { imageTypes } from "@/lib/FileTypes";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import MessageMediaPreview from "../messages/MessageMediaPreview";

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

const GroupChatInput = React.memo(() => {
  return (
    <div className="flex items-center space-x-2 p-6 dark:bg-gray-800">
      <textarea
        rows={1}
        className="flex-grow px-4 py-4 resize-none border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        placeholder="Type a message..."
      />
      <button className="cursor-pointer px-4 py-4 bg-primary-dark-pink text-white rounded-md hover:bg-primary-text-dark-pink">
        <LucideSendHorizonal className="w-5 h-5" />
      </button>
    </div>
  );
});

GroupChatInput.displayName = "GroupChatInput";

export default GroupChatInput;
