"use client";
import Link from "next/link"
import { LucideBell } from "lucide-react"
import { useNotificationStore } from "@/contexts/notification-context";
import { useEffect, useState } from "react";
const NotificationSidebarLink = () => {
     const { totalNotifications } = useNotificationStore()
     return (
          <span>
               <Link href="/notifications"
                    className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl">
                    <LucideBell />
                    <p>Notifications</p>
                    <span className="ml-auto h-8 w-8 p-0 font-bold flex items-center justify-center rounded-full bg-primary-dark-pink text-white">
                         {totalNotifications ? totalNotifications : 0}
                    </span>
               </Link>
          </span>
     );
}

export default NotificationSidebarLink;
