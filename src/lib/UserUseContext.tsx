"use client";

import {
  connectSocket,
  getSocket,
} from "@/components/sub_components/sub/Socket";
import { AuthUserProps } from "@/types/User";
import axiosInstance from "@/utils/Axios";
import { AxiosError, AxiosResponse } from "axios";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";
import { create } from "zustand";

interface UserState {
  user: Partial<AuthUserProps> | null;
  setUser: (user: Partial<AuthUserProps | null>) => void;
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
  children: ReactNode;
}

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const location = usePathname();
  const setUser = useUserStore((state) => state.setUser);
  const ref = useRef<number>(0);
  const postRegex = /\/posts\/[a-fA-F0-9-]+/;
  const isPostPage = postRegex.test(location);
  const profileRegex = /\/(@?[a-zA-Z0-9-]+)/;
  const isProfilePage = profileRegex.test(location);

  useEffect(() => {
    if (ref.current != 0) {
      return;
    }
    let intervalId: NodeJS.Timeout | undefined;
    async function fetchUser() {
      try {
        const res: AxiosResponse<{ user: AuthUserProps }> =
          await axiosInstance.get(`/auth/retrieve`, {
            withCredentials: true,
          });

        const user = res.data.user as AuthUserProps;
        const socket = connectSocket(user?.username);
        setUser(user);
        intervalId = setInterval(() => {
          socket?.emit("still-active", user?.username);
        }, 10_000);
        ref.current = 1;
        return;

        // if (res.status === 401 && (isPostPage || isProfilePage)) {
        //   // Set user to guest if on post or profile page
        //   return;
        // }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401 && (isPostPage || isProfilePage)) {
            axiosInstance
              .post(`/auth/token/refresh`)
              .then((res) => {
                console.log("refresihing token");
                return;
              })
              .catch(() => {
                window.location.href = `/login?redirect=${location}`;
                setUser(null);
              });
            return;
          }
        }
      }
    }

    fetchUser();
    return () => clearInterval(intervalId);
  }, [location, setUser, isPostPage, isProfilePage]);

  return <>{children}</>;
};
