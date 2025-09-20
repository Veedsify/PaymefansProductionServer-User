import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNotificationStore } from "@/contexts/NotificationContext";
import { notificationService } from "@/features/models/services/NotificationService";

export const useNotifications = (page: string = "1") => {
  const queryClient = useQueryClient();
  const { addAllNotifications, setTotalNotifications, setHasmore } =
    useNotificationStore();

  // Query for getting notifications
  const notificationsQuery = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationService.getNotifications(page),
    staleTime: 30000 * 5, // 2.5 minutes
    refetchInterval: 30000 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
  });

  // Query for unread count
  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutation for marking notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      notificationService.markAsRead(notificationId),
    onMutate: async (notificationId: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData([
        "notifications",
        page,
      ]);
      const previousUnreadCount = queryClient.getQueryData([
        "notifications",
        "unread-count",
      ]);

      // Optimistically update notifications
      queryClient.setQueryData(["notifications", page], (old: any) => {
        if (!old?.data?.notifications) return old;

        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((notification: any) =>
              notification.id.toString() === notificationId
                ? { ...notification, read: true }
                : notification,
            ),
          },
        };
      });

      // Optimistically update unread count
      queryClient.setQueryData(
        ["notifications", "unread-count"],
        (old: any) => {
          if (!old?.count) return old;
          return {
            ...old,
            count: Math.max(0, old.count - 1),
          };
        },
      );

      // Return a context object with the snapshotted value
      return { previousNotifications, previousUnreadCount };
    },
    onError: (err, notificationId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications", page],
          context.previousNotifications,
        );
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousUnreadCount,
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Update Zustand store when data changes
  useEffect(() => {
    if (
      notificationsQuery.data &&
      !notificationsQuery.data.error &&
      notificationsQuery.data.data
    ) {
      const { notifications, totalNotifications, hasMore } =
        notificationsQuery.data.data;
      addAllNotifications(notifications);
      setTotalNotifications(totalNotifications);
      setHasmore(hasMore);
    }
  }, [
    notificationsQuery.data,
    addAllNotifications,
    setTotalNotifications,
    setHasmore,
  ]);

  return {
    // Notifications data
    notifications: notificationsQuery.data?.data?.notifications || [],
    totalNotifications: notificationsQuery.data?.data?.totalNotifications || 0,
    hasMore: notificationsQuery.data?.data?.hasMore || false,

    // Unread count
    unreadCount: unreadCountQuery.data?.count || 0,

    // Loading states
    isLoading: notificationsQuery.isLoading,
    isUnreadCountLoading: unreadCountQuery.isLoading,

    // Error states
    error: notificationsQuery.error,
    unreadCountError: unreadCountQuery.error,

    // Actions
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,

    // Refetch functions
    refetch: notificationsQuery.refetch,
    refetchUnreadCount: unreadCountQuery.refetch,
  };
};

// Hook specifically for unread count (lighter weight)
export const useNotificationCount = () => {
  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    unreadCount: unreadCountQuery.data?.count || 0,
    isLoading: unreadCountQuery.isLoading,
    error: unreadCountQuery.error,
    refetch: unreadCountQuery.refetch,
  };
};
