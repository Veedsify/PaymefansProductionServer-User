import { MediaFile, Message } from "@/types/Components";
import { uniqBy } from "lodash";
import { create } from "zustand";
import _ from "lodash";

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  mediaFiles: MediaFile[];
  setMediaFiles?: (mediaFiles: MediaFile) => void;
  removeMediaFile: (fileKey: string) => void;
  addNewMessage: (newMessage: Message) => void;
  paginateMessages: (newMessages: Message[]) => void;
  updateSeenMessages: (messageIds: string[]) => void;
  setIsTyping: (isTyping: boolean) => void;
  resetAllMedia: () => void;
  resetMessages: () => void;
}

function setIsTyping(set: (fn: (state: ChatState) => ChatState) => void) {
  return (isTyping: boolean) => {
    set((state) => ({ ...state, isTyping }));
  };
}

function paginateMessages(set: (fn: (state: ChatState) => ChatState) => void) {
  return (newMessages: Message[]) => {
    if (!newMessages) return;
    set((state) => ({
      ...state,
      messages: uniqBy(
        [...state.messages, ...newMessages].reverse(),
        "message_id"
      ),
    }));
  };
}

function addNewMessage(set: (fn: (state: ChatState) => ChatState) => void) {
  return (newMessage: Message) => {
    set((state) => ({
      ...state,
      messages: uniqBy([...state.messages, newMessage], "message_id"),
    }));
  };
}

function setMediaFiles(
  set: (fn: (state: ChatState) => ChatState) => void
): (mediaFiles: MediaFile) => void {
  return (mediaFiles: MediaFile) => {
    set((state) => ({
      ...state,
      mediaFiles: state.mediaFiles
        ? [...state.mediaFiles, mediaFiles]
        : [mediaFiles],
    }));
  };
}

function updateSeenMessages(
  set: (fn: (state: ChatState) => ChatState) => void
): (messageIds: string[]) => void {
  return (messageIds: string[]) => {
    set((state) => ({
      ...state,
      messages: state.messages.map((message) =>
        messageIds.includes(message.message_id)
          ? { ...message, seen: true }
          : message
      ),
    }));
  };
}

function removeMediaFile(
  set: (fn: (state: ChatState) => ChatState) => void
): (fileKey: string) => void {
  return (fileKey: string) => {
    set((state) => ({
      ...state,
      mediaFiles: state.mediaFiles.filter((file) => file.id !== fileKey),
    }));
  };
}

function resetMessages(
  set: (fn: (state: ChatState) => ChatState) => void
): () => void {
  return () => {
    set((state) => ({
      ...state,
      messages: [],
    }));
  };
}

function resetAllMedia(
  set: (fn: (state: ChatState) => ChatState) => void
): () => void {
  return () => {
    set((state) => ({
      ...state,
      mediaFiles: [],
    }));
  };
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  newMessage: null,
  mediaFiles: [],
  setMediaFiles: setMediaFiles(set),
  removeMediaFile: removeMediaFile(set),
  addNewMessage: addNewMessage(set),
  paginateMessages: paginateMessages(set),
  updateSeenMessages: updateSeenMessages(set),
  setIsTyping: setIsTyping(set),
  resetAllMedia: resetAllMedia(set),
  resetMessages: resetMessages(set),
}));
