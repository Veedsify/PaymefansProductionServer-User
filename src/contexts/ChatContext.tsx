import { uniqBy } from "lodash-es";
import { create } from "zustand";
import type { Attachment, MediaFile, Message } from "@/types/Components";

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  mediaFiles: MediaFile[];
  setMediaFiles?: (mediaFiles: MediaFile[]) => void;
  removeMediaFile: (fileKey: string) => void;
  updateMediaFileStatus: (
    fileId: string,
    status: "idle" | "uploading" | "completed" | "error",
    progress?: number,
    attachment?: Attachment
  ) => void;
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
): (mediaFiles: MediaFile[]) => void {
  return (mediaFiles: MediaFile[]) => {
    set((state) => {
      const newFiles = state.mediaFiles
        ? [...state.mediaFiles, ...mediaFiles]
        : mediaFiles;
      return {
        ...state,
        mediaFiles: newFiles,
      };
    });
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
    set((state) => {
      // Find the file to be removed and clean up its blob URL
      const fileToRemove = state.mediaFiles.find((file) => file.id === fileKey);
      if (
        fileToRemove &&
        fileToRemove.previewUrl &&
        fileToRemove.previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      if (
        fileToRemove &&
        fileToRemove.posterUrl &&
        fileToRemove.posterUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(fileToRemove.posterUrl);
      }
      const filteredFiles = state.mediaFiles.filter(
        (file) => file.id !== fileKey
      );
      return {
        ...state,
        mediaFiles: filteredFiles,
      };
    });
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
function updateMediaFileStatus(
  set: (fn: (state: ChatState) => ChatState) => void
): (
  fileId: string,
  status: "idle" | "uploading" | "completed" | "error",
  progress?: number,
  attachment?: Attachment
) => void {
  return (fileId, status, progress, attachment) => {
    return set((state) => {
      const updatedFiles = state.mediaFiles.map((file) => {
        if (file.id === fileId) {
          const oldStatus = file.uploadStatus;
          // CRITICAL: Never reset completed files back to idle or uploading
          if (
            oldStatus === "completed" &&
            (status === "idle" || status === "uploading")
          ) {
            console.warn("🚫 Prevented reset of completed file:", {
              fileId,
              attemptedStatus: status,
              currentStatus: oldStatus,
            });
            return file; // Return unchanged
          }
          // Don't allow backwards progress for uploading files
          if (oldStatus === "uploading" && status === "idle") {
            console.warn("🚫 Prevented reset of uploading file back to idle:", {
              fileId,
              attemptedStatus: status,
              currentStatus: oldStatus,
            });
            return file; // Return unchanged
          }
          const newFile = {
            ...file,
            uploadStatus: status,
            uploadProgress:
              progress !== undefined ? progress : file.uploadProgress,
            attachment: attachment || file.attachment,
          };
          return newFile;
        }
        return file;
      });
      return {
        ...state,
        mediaFiles: updatedFiles,
      };
    });
  };
}
function resetAllMedia(
  set: (fn: (state: ChatState) => ChatState) => void
): () => void {
  return () => {
    return set((state) => {
      // Clean up all blob URLs before resetting
      state.mediaFiles.forEach((file) => {
        if (file.previewUrl && file.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(file.previewUrl);
        }
        if (file.posterUrl && file.posterUrl.startsWith("blob:")) {
          URL.revokeObjectURL(file.posterUrl);
        }
      });
      return {
        ...state,
        mediaFiles: [],
      };
    });
  };
}
export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  newMessage: null,
  mediaFiles: [],
  setMediaFiles: setMediaFiles(set),
  removeMediaFile: removeMediaFile(set),
  updateMediaFileStatus: updateMediaFileStatus(set),
  addNewMessage: addNewMessage(set),
  paginateMessages: paginateMessages(set),
  updateSeenMessages: updateSeenMessages(set),
  setIsTyping: setIsTyping(set),
  resetAllMedia: resetAllMedia(set),
  resetMessages: resetMessages(set),
}));
