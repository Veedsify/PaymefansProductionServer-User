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
  const { notifications, setTotalNotifications } = useNotificationStore();
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    const allUnreadNotifications = notifications.filter(
      (note) => note.read == false
    );
    setCount(allUnreadNotifications.length);
  }, [notifications]);

  return (
    <>
      <div className={className}>
        <div className="flex items-center mb-7">
          <span className="font-bold text-xl flex-shrink-0 dark:text-white">
            {children}
          </span>
          <div className="flex items-center justify-center w-8 h-8 aspect-square flex-shrink-0 ml-auto text-white md:py-3 md:px-3 py-1 px-1  bg-primary-text-dark-pink rounded-full font-bold">
            {count > 100 ? "99+" : count}
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
    <div>
      {(!notifications || notifications.length) === 0 ? (
        <div className="text-center py-2">No Notifications yet</div>
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
          >
            <div
              className={`w-full mt-3 select-none ${
                index + 1 === notifications.length && "border-b"
              } border-b border-gray-50/30 dark:border-slate-800 p-3 rounded flex items-center hover:border border-none dark:hover:bg-slate-800 dark:text-white hover:bg-gray-100 
                        ${
                          notification.read === false
                            ? "bg-messages-unread dark:bg-gray-800 cursor-pointer"
                            : "bg-white dark:bg-gray-950 cursor-default"
                        }
                        `}
            >
              <div
                role="img"
                style={{
                  color: types.find((type) => type.type === notification.action)
                    ?.color,
                }}
                className="focus:outline-none w-14 h-14 aspect-square rounded-full border border-gray-200 flex items-center justify-center"
              >
                {notification.action &&
                  types.find((type) => type.type === notification.action)?.icon}
              </div>
              <div className="pl-7 space-y-3">
                <p className="focus:outline-none leading-none max-w-[80%] notification_message_container">
                  <span
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                  ></span>
                </p>
                <p className="focus:outline-none text-sm leading-3 pt-1 text-gray-500">
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
          <LucideLoader className="animate-spin" />
        </div>
      )}
      <div ref={ref} className="h-1 w-full"></div>
    </div>
  );
}

export default Notify;
