"use client";
import { useAuthContext } from "@/contexts/UserUseContext";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

const HomeProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { isGuest, isLoading } = useAuthContext();
  useEffect(() => {
    if (isGuest && !isLoading) {
      router.push("/login");
    }
  }, [isGuest, router, isLoading]);
  return <div className="relative">{children}</div>;
};
export default HomeProvider;
