"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import ConfigProvider from "@/contexts/ConfigContext";
import GetLocationContext from "@/contexts/GetLocationContext";
import { MessagesConversationProvider } from "@/contexts/MessageConversationContext";
import ToggleWishListProvider from "@/contexts/ToggleWishlist";
import { AuthContextProvider } from "@/contexts/UserUseContext";
import UserAccountSuspendedScreen from "@/features/user/comps/UserAccountSuspendedScreen";
import getUserData from "@/utils/data/UserData";
import QueryProvider from "./QueryProvider";

interface CombinedProvidersProps {
  children: ReactNode;
}

const CombinedProviders = ({ children }: CombinedProvidersProps) => {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfileData"],
    queryFn: getUserData,
  });

  if (user && !user.active_status && !isLoading) {
    return <UserAccountSuspendedScreen user={user} />;
  }

  return (
    <ConfigProvider>
      <AuthContextProvider user={user}>
        <GetLocationContext>
          <MessagesConversationProvider>
            {children}
          </MessagesConversationProvider>
        </GetLocationContext>
      </AuthContextProvider>
    </ConfigProvider>
  );
};

export default CombinedProviders;
