import { getSocket } from "@/components/sub_components/sub/Socket";
import { useUserAuthContext, useUserStore } from "@/lib/UserUseContext";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useNotificationStore } from "./NotificationContext";

// Context for notification management
interface NotificationContextValue {
  totalNotifications: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationContextProvider"
    );
  }
  return context;
};

interface NotificationContextProviderProps {
  children: ReactNode;
}

export const NotificationContextProvider = ({
  children,
}: NotificationContextProviderProps) => {
  const user = useUserStore((state) => state.user);
  const { setTotalNotifications, totalNotifications } = useNotificationStore();
  const socket = getSocket(user?.username ?? null);

  const markAsRead = (notificationId: string) => {
    socket.emit("markNotificationAsRead", {
      userId: user?.user_id,
      notificationId,
    });
  };

  const markAllAsRead = () => {
    socket.emit("markAllNotificationsAsRead", { userId: user?.user_id });
  };

  useEffect(() => {
    const HandleNotificationReceived = (res: any) => {
      if (res?.error) {
        console.log("Error in notification", res?.data.message);
        return;
      }
      setTotalNotifications(res.data);
    };

    const HandleRestoreNotifications = () => {
      socket.emit("restoreNotifications", { userId: user?.user_id });
    };

    const HandleReconnect = () => {
      HandleRestoreNotifications();
      socket.emit("restoreRoom", { userId: user?.user_id });
    };

    if (!user?.user_id) return;

    socket.emit("notifications-join", user?.user_id);
    socket.on(`notifications-${user?.user_id}`, HandleNotificationReceived);
    socket.on("reconnect", HandleReconnect);

    return () => {
      socket.off(`notifications-${user?.user_id}`, HandleNotificationReceived);
      socket.off("reconnect", HandleReconnect);
    };
  }, [user?.user_id, setTotalNotifications, socket]);

  const contextValue: NotificationContextValue = {
    totalNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
