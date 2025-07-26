"use client";
import {
  NotificationIcontypes,
  useNotificationStore,
} from "@/contexts/NotificationContext";
import {
  useNotifications,
  useNotificationCount,
} from "@/hooks/useNotifications";
import { LucideLoader } from "lucide-react";
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";

export function NotificationHeader({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const { unreadCount } = useNotificationCount();

  return (
    <>
      <div className={className}>
        <div className="flex items-center mb-7">
          <span className="font-bold text-xl flex-shrink-0 dark:text-white">
            {children}
          </span>
          <div className="flex items-center justify-center w-8 h-8 aspect-square flex-shrink-0 ml-auto text-white md:py-3 md:px-3 py-1 px-1  bg-primary-text-dark-pink rounded-full font-bold">
            {unreadCount > 100 ? "99+" : unreadCount}
          </div>
        </div>
      </div>
      <NotificationBody />
    </>
  );
}

export function NotificationBody() {
  const [page, setPage] = useState<string>("1");
  const {
    notifications,
    hasMore,
    isLoading,
    error,
    markAsRead,
    isMarkingAsRead,
  } = useNotifications(page);

  const { updateNotification } = useNotificationStore();
  const types = NotificationIcontypes;
  const { ref, inView } = useInView();

  // Load more notifications when scrolling to bottom
  React.useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage((prev) => (parseInt(prev) + 1).toString());
    }
  }, [inView, hasMore, isLoading]);

  const handleNotificationClick = async (
    url: string,
    notification_id: string,
    id: number,
    read: boolean
  ) => {
    if (read) {
      // If already read, just navigate
      if (url && url !== "") {
        window.location.href = url;
      }
      return;
    }

    // Update local store immediately for instant UI feedback
    updateNotification(id.toString());

    // Mark as read on server using the numeric id
    markAsRead(id.toString());

    // Then navigate if URL exists
    if (url && url !== "") {
      window.location.href = url;
    }
  };

  if (error) {
    return (
      <div className="text-center py-2 text-sm text-red-500">
        An error occurred while fetching notifications.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(!notifications || notifications.length === 0) && !isLoading ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No Notifications yet
        </div>
      ) : (
        notifications.map((notification, index) => (
          <div
            key={`${notification.id}-${index}`}
            onClick={() =>
              handleNotificationClick(
                notification.url,
                notification.notification_id,
                notification.id,
                notification.read
              )
            }
            className={`transition-colors duration-150 rounded-lg cursor-pointer group ${
              notification.read
                ? "bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900"
                : "bg-messages-unread dark:bg-gray-800 hover:bg-messages-unread/90 dark:hover:bg-gray-700"
            }`}
          >
            <div
              className={`flex items-center gap-5 p-4 border-b last:border-b-0 border-gray-100 dark:border-slate-800`}
            >
              <div
                role="img"
                style={{
                  color: types.find((type) => type.type === notification.action)
                    ?.color,
                }}
                className="flex items-center justify-center w-12 h-12 rounded-full dark:border-gray-700 bg-white dark:bg-gray-900"
              >
                {notification.action &&
                  types.find((type) => type.type === notification.action)?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 dark:text-white notification_message_container leading-snug break-words">
                  <span
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                  ></span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                  {new Date(notification.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }
                  )}
                </p>
              </div>
              {isMarkingAsRead && (
                <div className="flex-shrink-0">
                  <LucideLoader className="animate-spin w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        ))
      )}
      {isLoading && (
        <div className="flex justify-center items-center py-5">
          <LucideLoader className="animate-spin text-primary" />
        </div>
      )}
      <div ref={ref} className="h-1 w-full"></div>
    </div>
  );
}
