import {
  DollarSign,
  Heart,
  MessageSquare,
  MessageSquareText,
  Radio,
  Repeat2,
  Sparkle,
  UserPlus,
  UserPlus2,
} from "lucide-react";
import { create } from "zustand";

type Notification = {
  id: number;
  read: boolean;
  notification_id: string;
  message: string;
  user_id: number;
  action:
    | "like"
    | "comment"
    | "follow"
    | "repost"
    | "message"
    | "live"
    | "purchase"
    | "sparkle";
  url: string;
  created_at: string;
};

type NotificationState = {
  notifications: Notification[];
  totalNotifications: number;
  hasMore: boolean;
  setHasmore: (hasMore: boolean) => void;
  updateNotification: (id: number) => void;
  setTotalNotifications: (count: number) => void;
  addNotification: (notification: Notification) => void;
  addAllNotifications: (notifications: Notification[]) => void;
};

type NotificationType = {
  type:
    | "like"
    | "comment"
    | "follow"
    | "repost"
    | "message"
    | "live"
    | "purchase"
    | "sparkle";
  icon: React.ReactNode;
  color: string;
};

export const NotificationIcontypes: NotificationType[] = [
  {
    type: "like",
    icon: <Heart size={30} strokeWidth={1} fill="indianred" />,
    color: "indianred",
  },
  {
    type: "follow",
    icon: <UserPlus2 size={30} strokeWidth={1} fill="green" />,
    color: "green",
  },
  {
    type: "purchase",
    icon: <DollarSign size={30} strokeWidth={1} />,
    color: "gold",
  },
  {
    type: "comment",
    icon: <MessageSquareText size={30} strokeWidth={1} fill="gray" />,
    color: "gray",
  },
  {
    type: "repost",
    icon: <Repeat2 size={30} strokeWidth={1} />,
    color: "cadetblue",
  },
  {
    type: "message",
    icon: <MessageSquare size={30} strokeWidth={1} fill="skyblue" />,
    color: "skyblue",
  },
  {
    type: "live",
    icon: <Radio size={30} strokeWidth={1} />,
    color: "red",
  },
  {
    type: "sparkle",
    icon: <Sparkle size={30} strokeWidth={1} fill="lime" />,
    color: "lime",
  },
];

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  hasMore: false,
  setHasmore: (hasMore: boolean) => set((state) => ({ hasMore })),
  totalNotifications: 0,
  updateNotification: (id: number) =>
    set((state) => {
      const notifications = state.notifications.map((note) =>
        note.id === id ? { ...note, read: true } : note
      );
      return { ...state, notifications };
    }),
  setTotalNotifications: (count: number) =>
    set((state) => ({ totalNotifications: count })),
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, notification] })),
  addAllNotifications: (notifications) => set({ notifications }),
}));
