import { DollarSign, Heart, MessageCircle, MessageCirclePlus, MessageSquare, MessageSquareText, Radio, Repeat2, Sparkle, UserPlus } from 'lucide-react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Notification = {
    id: number;
    read: boolean;
    notification_id: string;
    message: string;
    user_id: number;
    action: 'like' | 'comment' | 'follow' | 'repost' | 'message' | 'live' | 'purchase' | 'sparkle';
    url: string;
    created_at: string;
}

type NotificationState = {
    notifications: Notification[];
    totalNotifications: number;
    hasMore: boolean;
    setHasmore: (hasMore: boolean) => void
    updateNotification: (id: string) => void
    setTotalNotifications: (count: number) => void
    addNotification: (notification: Notification) => void;
    addAllNotifications: (notifications: Notification[]) => void;
}

type NotificationType = {
    type: 'like' | 'comment' | 'follow' | 'repost' | 'message' | 'live' | 'purchase' | 'sparkle';
    icon: React.ReactNode
    color: string;
}

export const NotificationIcontypes: NotificationType[] = [
    {
        type: 'like',
        icon: <Heart size={37} strokeWidth={1} fill="indianred" />,
        color: "indianred"
    },
    {
        type: 'follow',
        icon: <UserPlus size={37} strokeWidth={1} fill="green" />,
        color: "green"
    },
    {
        type: 'purchase',
        icon: <DollarSign size={37} strokeWidth={1} />,
        color: "gold"
    },
    {
        type: 'comment',
        icon: <MessageSquareText size={37} strokeWidth={1} fill="gray" />,
        color: "gray"
    },
    {
        type: 'repost',
        icon: <Repeat2 size={37} strokeWidth={1} />,
        color: "cadetblue"
    },
    {
        type: 'message',
        icon: <MessageSquare size={37} strokeWidth={1} fill="skyblue" />,
        color: "skyblue"
    },
    {
        type: 'live',
        icon: <Radio size={37} strokeWidth={1} />,
        color: "red"
    },
    {
        type: 'sparkle',
        icon: <Sparkle size={37} strokeWidth={1} fill="gold" />,
        color: "gold"
    }
]

export const useNotificationStore = create<NotificationState>()((set) => ({
    notifications: [],
    hasMore: false,
    setHasmore: (hasMore: boolean) => set((state) => ({ hasMore })),
    totalNotifications: 0,
    updateNotification: (id: string) => set((state) => {
        const notifications = state.notifications.map(note =>
            note.notification_id === id ? { ...note, read: true } : note
        );
        return { ...state, notifications };
    }),
    setTotalNotifications: (count: number) => set((state) => ({ totalNotifications: count })),
    addNotification: (notification) => set((state) => ({ notifications: [...state.notifications, notification] })),
    addAllNotifications: (notifications) => set({ notifications }),
}))
