"use client";
import { getSocket } from "@/components/sub_components/sub/Socket";
import { useUserAuthContext } from "@/lib/UserUseContext";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNotificationStore } from "./NotificationContext";

interface UserPointsContextValue {
  points: number;
  updatePoints: (newPoints: number) => void;
}

const PointsContext = createContext<UserPointsContextValue | null>(null);

export const useUserPointsContext = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error(
      "useUserPointsContext must be used within a UserPointsContextProvider or points is undefined"
    );
  }
  return context;
};

interface UserPointsContextProviderProps {
  children: ReactNode;
}

export const UserPointsContextProvider = ({
  children,
}: UserPointsContextProviderProps) => {
  const [points, setPoints] = useState(0);
  const { user } = useUserAuthContext();
  const { setTotalNotifications } = useNotificationStore();
  const socket = getSocket();

  useEffect(() => {
    const HandleNotificationReceived = (res: any) => {
      if (res?.error) {
        console.log("Error in notification", res?.data.message);
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
      socket.off(`noticiations-${user?.user_id}`, HandleNotificationReceived);
      socket.off("reconnect", HandleReconnect);
    };
  }, [user?.user_id, setTotalNotifications, socket]);

  const updatePoints = (newPoints: any) => {
    setPoints(newPoints);
  };

  return (
    <PointsContext.Provider value={{ points, updatePoints }}>
      {children}
    </PointsContext.Provider>
  );
};
