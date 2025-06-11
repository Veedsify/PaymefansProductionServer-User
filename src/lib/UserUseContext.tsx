"use client";

import { getSocket } from "@/components/sub_components/sub/Socket";
import { AuthUserProps } from "@/types/User";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { create } from "zustand";

interface UserState {
  user: AuthUserProps | null;
  setUser: (user: AuthUserProps | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useUserAuthContext = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  return { user, updateUser: setUser };
};

interface UserContextProviderProps {
  user: AuthUserProps | null;
  children: ReactNode;
}

export const UserContextProvider = ({
  user,
  children,
}: UserContextProviderProps) => {
  const location = usePathname();
  const setUser = useUserStore((state) => state.setUser);
  const socket = getSocket(user?.username ?? null);

  useEffect(() => {
    if (!user) {
      window.location.href = `/login?redirect=${location}`;
      return;
    }
    setUser(user);
    const intervalId = setInterval(() => {
      socket.emit("still-active", user?.username);
    }, 10_000);

    return () => clearInterval(intervalId);
  }, [user, location, socket, setUser]);

  return <>{children}</>;
};
