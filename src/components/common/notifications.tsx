"use client";
import {
  NotificationIcontypes,
  useNotificationStore,
} from "@/contexts/notification-context";
import { getToken } from "@/utils/cookie.get";
import axios from "axios";
import { LucideLoader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

function Notify() {
  return <div>Enter</div>;
}

export function NotificationHeader({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const { totalNotifications } = useNotificationStore();

  return (
    <>
      <div className={className}>
        <div className="flex items-center mb-7">
          <span className="font-bold text-xl flex-shrink-0 dark:text-white">
            {children}
          </span>
          <div className="flex items-center justify-center w-8 h-8 aspect-square flex-shrink-0 ml-auto text-white md:py-3 md:px-3 py-1 px-1  bg-primary-text-dark-pink rounded-full font-bold">
            {totalNotifications > 100 ? "99+" : totalNotifications}
          </div>
        </div>
      </div>
      <NotificationBody />
    </>
  );
}

export function NotificationBody() {
  const { notifications, updateNotification, addAllNotifications } =
    useNotificationStore();
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const types = NotificationIcontypes;
  const token = getToken();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setLoading(true);
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/notifications/${page}`;
      const response = await axios.post(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        const { data, hasMore: moreData } = response.data;
        setLoading(false);
        addAllNotifications(data);
        setHasMore(moreData);
      } else {
        setLoading(false);
        setError(true);
      }
    } catch (err) {
      setLoading(false);
      setError(true);
    }
  }, [page, token, addAllNotifications, setHasMore, setLoading, setError]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (
    url: string,
    notification_id: string,
    id: number,
    read: boolean
  ) => {
    if (read) return;
    if (url && url !== "") {
      const readUrl = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/notifications/read/${id}`;
      const readNotification = await axios.get(readUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (readNotification.status === 200) {
        updateNotification(notification_id);
        window.location.href = url;
      }
    } else {
      return;
    }
  };

  if (!loading && error) {
    return (
      <div className="text-center py-2 text-sm text-red-500">
        An error occurred while fetching notifications.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(!notifications || notifications.length) === 0 && !loading ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No Notifications yet
        </div>
      ) : (
        notifications.map((notification, index) => (
          <div
            key={index}
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
            </div>
          </div>
        ))
      )}
      {loading && (
        <div className="flex justify-center items-center py-5">
          <LucideLoader className="animate-spin text-primary" />
        </div>
      )}
      <div ref={ref} className="h-1 w-full"></div>
    </div>
  );
}

export default Notify;
