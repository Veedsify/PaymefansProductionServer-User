"use client";

import { connectSocket } from "@/components/common/Socket";
import { postRegex, profileRegex } from "@/constants/regex";
import { AuthUserProps } from "@/features/user/types/user";
import axiosInstance from "@/utils/Axios";
import { AxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Socket } from "socket.io-client";

interface AuthContextType {
  user: Partial<AuthUserProps> | null;
  setUser: (user: Partial<AuthUserProps | null>) => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UseAuthProvider");
  }
  return context;
};

export const AuthContextProvider = ({
  children,
  user: initialUser,
}: {
  children: ReactNode;
  user: Partial<AuthUserProps> | undefined;
}) => {
  const [user, setUser] = useState<Partial<AuthUserProps | null>>(
    initialUser || null
  );
  const [isGuest, setIsGuest] = useState(true);
  const router = useRouter();
  const location = usePathname();
  const ref = useRef<number>(0);
  const isPostPage = postRegex.test(location);
  const isProfilePage = !isPostPage && profileRegex.test(location);
  let socket: Socket | null;
  let intervalId: NodeJS.Timeout | undefined;

  const fetchUser = useCallback(async () => {
    if (ref.current != 0) {
      return;
    }
    try {
      const res = await axiosInstance.get(`/auth/retrieve`, {
        withCredentials: true,
      });

      if (res.status === 401) {
        setUser({
          name: "Guest",
          username: "guest",
          email: "",
          id: 0,
          active_status: true,
          is_model: false,
        });
        if (!isProfilePage) {
          router.push("/login");
        }
        return null;
      }

      const user = res.data && (res.data.user as AuthUserProps);
      socket = connectSocket(user?.username);
      setIsGuest(false);
      setUser(user);
      ref.current += 1;
      return user;
    } catch (err: unknown) {
      setUser({
        id: 0,
        name: "Guest",
        username: "@guest",
        email: "",
        active_status: true,
        is_model: false,
      });
      ref.current += 1;
      if (!isProfilePage && !isPostPage) {
        router.push("/login");
      }
      return null;
    }
  }, []);

  useLayoutEffect(() => {
    if (!user) {
      fetchUser();
    }
    setIsGuest(!user || user?.username === "guest");
  }, [fetchUser, user]);

  useLayoutEffect(() => {
    if (ref.current != 0) {
      return;
    }
    fetchUser();
    intervalId = setInterval(() => {
      socket?.emit("still-active", user?.username);
    }, 10_000);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.username, fetchUser]);

  const value = { user, setUser, isGuest };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
