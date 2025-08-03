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
        className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
      >
        <LucideBell />
        <p>Notifications</p>
        {!isLoading && unreadCount > 0 && (
          <span className="flex items-center justify-center w-8 h-8 p-0 ml-auto text-sm font-bold text-white rounded-full bg-primary-dark-pink">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </span>
  );
};

export default NotificationSideBarLink;
