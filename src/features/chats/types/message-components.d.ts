// types/components.ts

// Existing types
export interface Attachment {
  id: string;
  url: string;
  type: string;
  filename: string;
  // Add any other properties from your original implementation
}

export interface MessageInputProps {
  sendMessage: (message: any) => void;
  sendTyping: (message: string) => void;
  receiver: {
    user_id: string;
    name: string;
  };
  isFirstMessage: boolean;
}

// New types for the unified components
export interface MediaFile {
  id: string; // Unique identifier for the media file
  file: File;
  type: "image" | "video";
  previewUrl: string;
  posterUrl?: string; // For videos
}

export interface MediaContextState {
  mediaFiles: MediaFile[];
  message: string;
  isModalOpen: boolean;
  addFiles: (files: FileList) => void;
  removeFile: (index: number, id: string) => void;
  setMessage: (message: string) => void;
  openModal: () => void;
  closeModal: () => void;
  resetAll: () => void;
  revokeUrls: () => void;
}

// Define supported file types (move from hard-coded in components)
export const imageTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/ico",
];


export type MessageMediaPreViewProps = {
  index: number;
  file: MediaFile;
}

export const videoTypes = ["video/mp4", "video/webm", "video/ogg"];
