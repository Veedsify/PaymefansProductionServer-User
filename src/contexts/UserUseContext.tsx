"use client";
import type { AxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Socket } from "socket.io-client";
import { connectSocket } from "@/components/common/Socket";
import ERROR_STATUS from "@/constants/error_status";
import { postRegex, profileRegex } from "@/constants/regex";
import type { AuthUserProps } from "@/features/user/types/user";
import axiosInstance, { AuthFailureError } from "@/utils/Axios";

interface AuthContextType {
  user: Partial<AuthUserProps> | null;
  setUser: (user: Partial<AuthUserProps | null>) => void;
  isGuest: boolean;
  isLoading: boolean;
  setGuestUser: () => void; // Add method to manually set guest state
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
    initialUser || null,
  );
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const location = usePathname();
  const ref = useRef<number>(0);
  const isPostPage = postRegex.test(location);
  const isProfilePage = !isPostPage && profileRegex.test(location);
  let socket: Socket | null;
  let intervalId: NodeJS.Timeout | undefined;

  // Standardized guest user object
  const createGuestUser = () => ({
    id: 0,
    name: "Guest",
    username: "guest",
    email: "",
    active_status: true,
    is_model: false,
  });

  // Method to set guest user state
  const setGuestUser = useCallback(() => {
    const guestUser = createGuestUser();
    setUser(guestUser);
    setIsGuest(true);
    setIsLoading(false);
  }, []);

  const fetchUser = useCallback(async () => {
    if (ref.current != 0) {
      return;
    }

    // Check if we have a token before making the request
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      setGuestUser();
      ref.current += 1;

      if (!isProfilePage && !isPostPage) {
        router.push("/login");
      }
      return null;
    }

    setIsLoading(true);

    try {
      const res = await axiosInstance.get(`/auth/retrieve`, {
        withCredentials: true,
      });

      const user = res.data && (res.data.user as AuthUserProps);
      if (user) {
        socket = connectSocket(user?.username);
        setIsGuest(false);
        setUser(user);
      } else {
        setGuestUser();
      }

      setIsLoading(false);
      ref.current += 1;
      return user;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;

      // Handle AuthFailureError specifically (from failed token refresh)
      if (err instanceof AuthFailureError) {
        console.log("Authentication failed - setting guest user");
        setGuestUser();
        ref.current += 1;
        return null;
      }

      // For 401 errors from initial auth call, also set guest
      if (axiosError?.response?.status === 401) {
        console.log("401 error - setting guest user");
        setGuestUser();
        ref.current += 1;

        if (!isProfilePage && !isPostPage) {
          router.push("/login");
        }
        return null;
      }

      // For other errors, also set guest user
      if (axiosError?.response?.status !== 401) {
        setGuestUser();
        ref.current += 1;

        if (!isProfilePage && !isPostPage) {
          router.push("/login");
        }
      } else {
        // For other 401 errors, let the Axios interceptor handle it
        setIsLoading(false);
      }

      return null;
    }
  }, [router, isProfilePage, isPostPage]);

  useLayoutEffect(() => {
    if (!user) {
      fetchUser();
    } else {
      setIsGuest(user?.username === "guest");
      setIsLoading(false);
    }
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

  const value = { user, setUser, isGuest, isLoading, setGuestUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
