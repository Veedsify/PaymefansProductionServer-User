"use client";

import { getSocket } from "@/components/sub_components/sub/Socket";
import { AuthUserProps } from "@/types/User";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserContextValue {
  user: AuthUserProps | null;
  updateUser: (newUserData: AuthUserProps) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const useUserAuthContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUserAuthContext must be used within a UserContextProvider"
    );
  }
  return context;
};

interface UserContextProviderProps {
  user: AuthUserProps | null;
  children: ReactNode;
}

export const UserContextProvider = ({
  user,
  children,
}: UserContextProviderProps) => {
  const router = useRouter();
  const location = usePathname();
  const socket = getSocket();
  const [thisUser, setUser] = useState<AuthUserProps | null>(null);

  useEffect(() => {
    if (!user) {
      window.location.href = `/login?redirect=${location}`;
      return; // exit early
    }

    setUser(user);
    socket.emit("user_active", user.username);

    const intervalId = setInterval(() => {
      socket.emit("still-active", user?.username);
    }, 25_000);

    return () => clearInterval(intervalId); // CLEAN UP on unmount or dependency change
  }, [user, location, socket]);

  const updateUser = (newUserData: AuthUserProps) => {
    setUser(newUserData);
  };

  return (
    <UserContext.Provider value={{ user: thisUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
