"use client";

import { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { AuthContextProvider } from "@/contexts/UserUseContext";
import ToggleWishListProvider from "@/contexts/ToggleWishlist";
import UserAccountSuspendedScreen from "@/features/user/comps/UserAccountSuspendedScreen";
import { MessagesConversationProvider } from "@/contexts/MessageConversationContext";
import ConfigProvider from "@/contexts/ConfigContext";
import GetLocationContext from "@/contexts/GetLocationContext";
import { useQuery } from "@tanstack/react-query";
import getUserData from "@/utils/data/UserData";

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
