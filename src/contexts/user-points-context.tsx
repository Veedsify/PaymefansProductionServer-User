"use client";
import { socket } from "@/components/sub_components/sub/socket";
import { useUserAuthContext } from "@/lib/userUseContext";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNotificationStore } from "./notification-context";

interface UserPointsContextValue {
  points: number;
  updatePoints: (newPoints: number) => void;
}

const UserPointsContext = createContext<UserPointsContextValue | null>(null);

export const useUserPointsContext = () => {
  const context = useContext(UserPointsContext);
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

  useEffect(() => {
    const HandleNotificationReceived = (res: any) => {
      if (res?.error) {
        console.log("Error in notification", res?.data.message);
      }
      setTotalNotifications(res.data);
    };

    if (!user?.user_id) return;
    socket.emit("notifications-join", user?.user_id);
    socket.on(`notifications-${user?.user_id}`, HandleNotificationReceived);

    return () => {
      socket.off(`noticiations-${user?.user_id}`, HandleNotificationReceived);
    };
  }, [user?.user_id, setTotalNotifications]);

  const updatePoints = (newPoints: any) => {
    setPoints(newPoints);
  };

  return (
    <UserPointsContext.Provider value={{ points, updatePoints }}>
      {children}
    </UserPointsContext.Provider>
  );
};
