"use client";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInView } from "react-intersection-observer";
import {
  NotificationIcontypes,
  useNotificationStore,
} from "@/contexts/NotificationContext";

import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import { useNotificationCount } from "./hooks/useNotifications";
import { useNotifications } from "./hooks";

interface NotificationHeaderProps {
  children: string;
  className?: string;
}

export default function NotificationHeader({
  children,
  className,
}: NotificationHeaderProps) {
  const { unreadCount } = useNotificationCount();
  const displayCount = useMemo(
    () => (unreadCount > 100 ? "99+" : unreadCount.toString()),
    [unreadCount]
  );

  return (
    <div className={className}>
      <div className="flex items-center mb-7">
        <span className="flex-shrink-0 text-xl font-bold dark:text-white">
          {children}
        </span>
        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 px-1 py-1 ml-auto font-bold text-white rounded-full aspect-square md:py-3 md:px-3 bg-primary-text-dark-pink">
          {displayCount}
        </div>
      </div>
      <NotificationBody />
    </div>
  );
}

interface NotificationItemProps {
  notification: any;
  onNotificationClick: (
    url: string,
    notification_id: string,
    id: number,
    read: boolean
  ) => void;
  isMarkingAsRead: boolean;
  types: any[];
}

const NotificationItem = React.memo(function NotificationItem({
  notification,
  onNotificationClick,
  isMarkingAsRead,
  types,
}: NotificationItemProps) {
  const notificationType = useMemo(
    () => types.find((type) => type.type === notification.action),
    [types, notification.action]
  );

  const messageRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      e.stopPropagation();
      // Link navigation will proceed naturally
    };

    const links = messageRef.current?.querySelectorAll("a") || [];
    links.forEach((link: Element) => {
      link.addEventListener("click", handleLinkClick);
    });

    return () => {
      links.forEach((link: Element) => {
        link.removeEventListener("click", handleLinkClick);
      });
    };
  }, [notification.message]);

  const formattedDate = useMemo(
    () =>
      new Date(notification.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
    [notification.created_at]
  );

  const handleClick = useCallback(() => {
    onNotificationClick(
      notification.url,
      notification.notification_id,
      notification.id,
      notification.read
    );
  }, [notification, onNotificationClick]);

  return (
    <div
      onClick={handleClick}
      className={`rounded-lg cursor-pointer group ${
        notification.read
          ? "bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900"
          : "bg-messages-unread dark:bg-gray-800 hover:bg-messages-unread/90 dark:hover:bg-gray-700"
      }`}
    >
      <div className="flex items-center gap-5 p-4 border-b last:border-b-0 border-gray-100 dark:border-slate-800">
        <div
          role="img"
          style={{ color: notificationType?.color }}
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full dark:border-gray-700 dark:bg-gray-900"
        >
          {notificationType?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium leading-snug text-gray-900 break-words dark:text-white notification_message_container">
            <span
              ref={messageRef}
              dangerouslySetInnerHTML={{ __html: notification.message }}
            />
          </p>
          <p className="pt-2 text-xs text-gray-500 dark:text-gray-400">
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
});

export function NotificationBody() {
  const [page, setPage] = useState(1);
  const {
    notifications,
    hasMore,
    isLoading,
    error,
    markAsRead,
    isMarkingAsRead,
  } = useNotifications(page.toString());

  const { updateNotification } = useNotificationStore();
  const { ref, inView } = useInView();
  const router = useRouter();

  React.useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, isLoading]);

  const handleNotificationClick = useCallback(
    async (url: string, notification_id: string, id: number, read: boolean) => {
      if (url) router.push(url);
      updateNotification(id);
      markAsRead(id);
    },
    [router, updateNotification, markAsRead]
  );

  if (error) {
    return (
      <div className="py-2 text-sm text-center text-red-500">
        An error occurred while fetching notifications.
      </div>
    );
  }

  if (!notifications?.length && !isLoading) {
    return (
      <div className="py-4 text-center text-gray-500 dark:text-gray-400">
        No Notifications yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications?.map((notification: any) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onNotificationClick={handleNotificationClick}
          isMarkingAsRead={isMarkingAsRead}
          types={NotificationIcontypes}
        />
      ))}
      {isLoading && (
        <div className="flex items-center justify-center py-5">
          <LoadingSpinner />
        </div>
      )}
      <div ref={ref} className="w-full h-1" />
    </div>
  );
}
