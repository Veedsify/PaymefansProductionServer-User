export interface Attachment {
  type: "image" | "video";
  extension: string;
  id: string;
  poster?: string;
  size: number;
  name: string;
  url: string;
  preview?: string; // For local preview before upload
}

interface MessageData {
  text: string;
  attachments: Attachment[];
  isActive: boolean;
}

export interface Messages {
  followers: MessageData;
  subscribers: MessageData;
}

interface EditingMode {
  followers: boolean;
  subscribers: boolean;
}

export type MessageType = keyof Messages;

export interface MessageCardProps {
  type: MessageType;
  title: string;
  icon: any; // LucideIcon
  placeholder: string;
}
