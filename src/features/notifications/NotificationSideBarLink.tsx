"use client";
import { LucideBell } from "lucide-react";
import Link from "next/link";
import { useNotificationCount } from "@/hooks/useNotifications";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";

const NotificationSideBarLink = () => {
  const { unreadCount, isLoading } = useNotificationCount();
  const pathname = usePathname();

  return (
    <span>
      <Link
        href="/notifications"
        className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
      >
        <LucideBell
          className={cn("h-6 md:h-6", {
            "stroke-black dark:stroke-white":
              !pathname.startsWith("/notifications"),
            "stroke-primary-dark-pink": pathname.startsWith("/notifications"),
          })}
        />
        <p>Notifications</p>
        {!isLoading && unreadCount > 0 && (
          <span className="flex items-center justify-center w-6 h-6 p-0 ml-auto text-xs font-bold text-white rounded-full bg-red-600">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </span>
  );
};

export default NotificationSideBarLink;
