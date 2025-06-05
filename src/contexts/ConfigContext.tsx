"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { MediaContextState } from "@/types/MessageComponents";
import ROUTE from "@/config/routes";
import { useRouter } from "next/navigation";

type Configs = {
  id: number;
  app_name: string;
  app_version: string;
  app_url: string;
  app_description: string;
  app_logo: string;
  default_currency: string;
  platform_deposit_fee: number;
  platform_withdrawal_fee: number;
  default_rate: number;
  default_symbol: string;
  point_conversion_rate: number;
  point_conversion_rate_ngn: number;
  min_withdrawal_amount: number;
  min_withdrawal_amount_ngn: number;
  min_deposit_amount: number;
  min_deposit_amount_ngn: number;
  default_mode: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  home_feed_limit: number;
  personal_profile_limit: number;
  personal_media_limit: number;
  personal_repost_limit: number;
  post_page_comment_limit: number;
  post_page_comment_reply_limit: number;
  other_user_profile_limit: number;
  other_user_media_limit: number;
  other_user_repost_limit: number;
  notification_limit: number;
  transaction_limit: number;
  model_search_limit: number;
  conversation_limit: number;
  message_limit: number;
  group_message_limit: number;
  group_participant_limit: number;
  group_limit: number;
  hookup_enabled: boolean;
  hookup_page_limit: number;
  status_limit: number;
  subscription_limit: number;
  subscribers_limit: number;
  active_subscribers_limit: number;
  followers_limit: number;
  upload_media_limit: number;
  model_upload_media_limit: number;
  profile_updated_success_message: string;
  profile_updated_error_message: string;
  profile_updating_message: string;
  profile_image_updated_success_message: string;
  profile_image_updated_error_message: string;
  profile_image_updating_message: string;
  point_purchase_success_message: string;
  point_purchase_error_message: string;
  point_purchasing_message: string;
  point_purchase_minimum_message: string;
  created_at: Date;
  updated_at: Date;
};

type ConfigContextProps = {
  config: Configs | undefined;
  updateConfig: (config: Configs) => void;
};

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const useConfigContext = (): ConfigContextProps => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("UseConfigContext must be within a Config Provider");
  }
  return context;
};

export default function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Configs | undefined>(undefined);
  const router = useRouter();
  useEffect(() => {
    async function fetchConfigs() {
      try {
        const response = await fetch(ROUTE.GET_SYSTEM_CONFIGS);
        const data = await response.json();
        setConfig(data.data);
        console.log("System Configs: ", data);
      } catch (error: any) {
        router.push("/error?error=fetch_configs");
        throw new Error("Error fetching configs: " + error.message);
      }
    }

    fetchConfigs();
  }, [router]);

  const updateConfig = useCallback(
    (config: Configs) => {
      setConfig(config);
    },
    [setConfig]
  );

  const value = {
    config,
    updateConfig,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}
