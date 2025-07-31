import axiosInstance from "@/utils/Axios";

interface NotificationResponse {
    error: boolean;
    message?: string;
    data?: {
        notifications: Array<{
            id: number;
            read: boolean;
            notification_id: string;
            message: string;
            user_id: number;
            action: "like" | "comment" | "follow" | "repost" | "message" | "live" | "purchase" | "sparkle";
            url: string;
            created_at: string;
        }>;
        totalNotifications: number;
        hasMore: boolean;
    };
}

export const notificationService = {
    // Get notifications with pagination
    getNotifications: async (page: string = "1"): Promise<NotificationResponse> => {
        const response = await axiosInstance.get(`/notifications/${page}`);
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId: string): Promise<{ error: boolean; message?: string }> => {
        const response = await axiosInstance.put(`/notifications/read/${notificationId}`);
        return response.data;
    },

    // Get unread count
    getUnreadCount: async (): Promise<{ error: boolean; count?: number; message?: string }> => {
        const response = await axiosInstance.get('/notifications/unread-count');
        return response.data;
    }
};