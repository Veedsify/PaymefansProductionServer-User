import { MediaFile, Message, Attachment } from "@/types/Components";
import { uniqBy } from "lodash";
import { create } from "zustand";
import _ from "lodash";

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  mediaFiles: MediaFile[];
  setMediaFiles?: (mediaFiles: MediaFile) => void;
  removeMediaFile: (fileKey: string) => void;
  updateMediaFileStatus: (
    fileId: string,
    status: "idle" | "uploading" | "completed" | "error",
    progress?: number,
    attachment?: Attachment,
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
        "message_id",
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
  set: (fn: (state: ChatState) => ChatState) => void,
): (mediaFiles: MediaFile) => void {
  return (mediaFiles: MediaFile) => {
    console.log("➕ Adding new media file:", {
      id: mediaFiles.id,
      type: mediaFiles.type,
      status: mediaFiles.uploadStatus || "idle",
    });

    set((state) => {
      const newFiles = state.mediaFiles
        ? [...state.mediaFiles, mediaFiles]
        : [mediaFiles];

      console.log("📁 Total media files:", newFiles.length);
      return {
        ...state,
        mediaFiles: newFiles,
      };
    });
  };
}

function updateSeenMessages(
  set: (fn: (state: ChatState) => ChatState) => void,
): (messageIds: string[]) => void {
  return (messageIds: string[]) => {
    set((state) => ({
      ...state,
      messages: state.messages.map((message) =>
        messageIds.includes(message.message_id)
          ? { ...message, seen: true }
          : message,
      ),
    }));
  };
}

function removeMediaFile(
  set: (fn: (state: ChatState) => ChatState) => void,
): (fileKey: string) => void {
  return (fileKey: string) => {
    console.log("🗑️ Removing media file:", fileKey);

    set((state) => {
      const filteredFiles = state.mediaFiles.filter(
        (file) => file.id !== fileKey,
      );
      console.log("📁 Remaining media files:", filteredFiles.length);
      return {
        ...state,
        mediaFiles: filteredFiles,
      };
    });
  };
}

function resetMessages(
  set: (fn: (state: ChatState) => ChatState) => void,
): () => void {
  return () => {
    set((state) => ({
      ...state,
      messages: [],
    }));
  };
}

function updateMediaFileStatus(
  set: (fn: (state: ChatState) => ChatState) => void,
): (
  fileId: string,
  status: "idle" | "uploading" | "completed" | "error",
  progress?: number,
  attachment?: Attachment,
) => void {
  return (fileId, status, progress, attachment) => {
    console.log("🔄 Updating media file status:", {
      fileId,
      status,
      progress,
      hasAttachment: !!attachment,
    });

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

          console.log("📝 File status change:", {
            fileId,
            from: oldStatus,
            to: status,
            progress: progress,
          });

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
  set: (fn: (state: ChatState) => ChatState) => void,
): () => void {
  return () => {
    console.log("🔄 Resetting all media files");
    return set((state) => ({
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
  updateMediaFileStatus: updateMediaFileStatus(set),
  addNewMessage: addNewMessage(set),
  paginateMessages: paginateMessages(set),
  updateSeenMessages: updateSeenMessages(set),
  setIsTyping: setIsTyping(set),
  resetAllMedia: resetAllMedia(set),
  resetMessages: resetMessages(set),
}));
