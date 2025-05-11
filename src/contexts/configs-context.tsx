"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { MediaContextState } from "@/types/message-components";
import ROUTE from "@/config/routes";
import { useRouter } from "next/navigation";

type Configs = {
  app_name: string;
  app_version: string;
  app_url: string;
  app_logo: string;
};

type ConfigContextProps = {
  config: Configs | undefined;
  updateConfig: (config: Configs) => void;
};

export const ConfigContext = createContext<ConfigContextProps | undefined>(
  undefined
);

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
        console.log("System Configs: ", data.data);
      } catch (error: any) {
        router.push("/error?error=fetch_configs");
        throw new Error("Error fetching configs: " + error.message);
      }
    }

    fetchConfigs();
  }, []);

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
