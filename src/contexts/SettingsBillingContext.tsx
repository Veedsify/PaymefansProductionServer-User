import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { useAuthContext } from "./UserUseContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SettingsBillingProps {
  children: React.ReactNode;
  current_data: Settings;
}

interface Settings {
  subscription: boolean;
  subscription_price: number;
  subscription_duration: number;
  price_per_message: number;
  enable_free_message: boolean;
}

interface SettingsBillingContextProps {
  settings: Settings | null;
  saveSettings: () => void;
  setSubscription: (state: Settings) => void;
}

const settingsBillingContext = createContext({} as SettingsBillingContextProps);

export const useSettingsBillingContext = () => {
  const context = useContext(settingsBillingContext);
  if (context === undefined) {
    throw new Error(
      "useSettingsBillingContext must be used within a SettingsBillingProvider",
    );
  }
  return context;
};

export const SettingsBillingProvider: React.FC<SettingsBillingProps> = ({
  children,
}) => {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const queryClient = useQueryClient();
  const setSubscription = async (subscription: Settings) => {
    setSettings(subscription);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["settings-billing"],
    queryFn: async () => {
      const res = await axiosInstance.get("/settings");
      return res.data;
    },
  });

  const current_data = data?.settings;

  useEffect(() => {
    if (current_data) {
      setSettings(current_data);
    }
  }, [current_data]);

  const saveSettings = async () => {
    try {
      const res = await axiosInstance.post(
        `/settings/billings/message-price`,
        settings,
      );
      if (res.data.status) {
        toast.success("Settings saved successfully", {
          id: "settings-saved",
        });
        queryClient.invalidateQueries({ queryKey: ["settings-billing"] });
        return;
      }
      toast.error("Error saving settings", {
        id: "settings-saved",
      });
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    if (current_data) {
      setSettings(current_data);
    }

    return () => {
      setSettings({
        subscription: false,
        subscription_price: 0,
        subscription_duration: 0,
        price_per_message: 0,
        enable_free_message: false,
      });
    };
  }, [current_data]);

  const value = {
    settings,
    saveSettings,
    setSubscription,
  };

  return (
    <settingsBillingContext.Provider value={value}>
      {children}
    </settingsBillingContext.Provider>
  );
};
