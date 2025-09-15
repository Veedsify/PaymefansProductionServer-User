"use client";

import { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { AuthContextProvider } from "@/contexts/UserUseContext";
import ToggleWishListProvider from "@/contexts/ToggleWishlist";
import { MessagesConversationProvider } from "@/contexts/MessageConversationContext";
import ConfigProvider from "@/contexts/ConfigContext";
import GetLocationContext from "@/contexts/GetLocationContext";

interface CombinedProvidersProps {
  children: ReactNode;
}

/**
 * Combined providers component to reduce nesting and improve performance.
 * Providers are ordered by dependency requirements and frequency of updates.
 */
const CombinedProviders = ({ children }: CombinedProvidersProps) => {
  return (
    <ConfigProvider>
      <QueryProvider>
        <AuthContextProvider>
          <GetLocationContext>
            <MessagesConversationProvider>
              {children}
            </MessagesConversationProvider>
          </GetLocationContext>
        </AuthContextProvider>
      </QueryProvider>
    </ConfigProvider>
  );
};

export default CombinedProviders;
