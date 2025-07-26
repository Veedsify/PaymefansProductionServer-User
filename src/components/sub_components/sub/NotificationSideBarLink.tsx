"use client";
import Link from "next/link";
import { LucideBell } from "lucide-react";
import { useNotificationCount } from "@/hooks/useNotifications";

const NotificationSideBarLink = () => {
  const { unreadCount, isLoading } = useNotificationCount();

  return (
    <span>
      <Link
        href="/notifications"
        className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
      >
        <LucideBell />
        <p>Notifications</p>
        {!isLoading && unreadCount > 0 && (
          <span className="ml-auto h-8 w-8 p-0 font-bold flex items-center justify-center rounded-full bg-primary-dark-pink text-white text-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </span>
  );
};

export default NotificationSideBarLink;
