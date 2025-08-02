"use client";

import {
  connectSocket,
  getSocket,
} from "@/components/sub_components/sub/Socket";
import { AuthUserProps } from "@/types/User";
import axiosInstance from "@/utils/Axios";
import { AxiosResponse } from "axios";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";
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

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const location = usePathname();
  const setUser = useUserStore((state) => state.setUser);
  const ref = useRef<number>(0);

  useEffect(() => {
    if (ref.current != 0) {
      return;
    }
    let intervalId: NodeJS.Timeout | undefined;
    async function fetchUser() {
      const res: AxiosResponse<{ user: AuthUserProps }> =
        await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/retrieve`,
          {
            withCredentials: true,
          },
        );

      if (res.status === 401) {
        window.location.href = `/login?redirect=${location}`;
      }

      if (res.status === 200 && res.data?.user) {
        const user = res.data.user as AuthUserProps;
        const socket = connectSocket(user?.username);
        setUser(user);
        intervalId = setInterval(() => {
          socket?.emit("still-active", user?.username);
        }, 10_000);
        ref.current = 1;
      } else {
        window.location.href = `/login?redirect=${location}`;
        setUser(null);
      }
    }

    fetchUser();
    return () => clearInterval(intervalId);
  }, [location, setUser]);

  return <>{children}</>;
};
