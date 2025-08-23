"use client";

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import ProfileSettings from "../sub_components/ProfileSettings";
import Settingsbilling from "../sub_components/SettingsBilling";
import SettingsSecurity from "../sub_components/SettingsSecurity";
import { AuthUserProps } from "@/types/User";
import { MouseEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SettingsBillingProvider } from "@/contexts/SettingsBillingContext";
import { useUserAuthContext } from "@/lib/UserUseContext";
import SettingsAutomatedMessage from "../sub_components/SettingsAutomatedMessage";

const SettingsTab = ({ user }: { user: Partial<AuthUserProps> | null }) => {
  const searchParams = useSearchParams();
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const tab = e.currentTarget.getAttribute("data-tab");
    window.history.pushState({}, "", `?tab=${tab}`);
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      const index = [
        "profile",
        "security",
        "billing",
        "automated_messages",
      ].indexOf(tab);
      if (index > -1) {
        // document.querySelectorAll(".react-tabs__tab")[index].click();
      }
    }
  }, [searchParams]);

  return (
    <div>
      <Tabs selectedTabClassName="border-b-4 border-primary-dark-pink">
        <TabList className="flex mb-4 border-b gap-9 border-black/30 dark:border-white/30">
          <Tab>
            <button
              onClick={handleClick}
              data-tab="profile"
              className="py-2 font-bold text-black cursor-pointer dark:text-white"
            >
              Profile
            </button>
          </Tab>
          <Tab>
            <button
              onClick={handleClick}
              data-tab="security"
              className="py-2 font-bold text-black cursor-pointer dark:text-white"
            >
              Security
            </button>
          </Tab>
          {user?.is_model && user.Model?.verification_status === true && (
            <>
              <Tab>
                <button
                  onClick={handleClick}
                  data-tab="billing"
                  className="py-2 font-bold text-black cursor-pointer dark:text-white"
                >
                  Billing
                </button>
              </Tab>
              <Tab>
                <button
                  onClick={handleClick}
                  data-tab="automated_messages"
                  className="py-2 font-bold text-black cursor-pointer dark:text-white"
                >
                  Automated Messages
                </button>
              </Tab>
            </>
          )}
        </TabList>
        <TabPanel>
          <ProfileSettings user={user} />
        </TabPanel>
        <TabPanel>
          <SettingsSecurity />
        </TabPanel>
        {user?.is_model && user.Model?.verification_status === true && (
          <>
            <TabPanel>
              <SettingsBillingProvider
                current_data={{
                  subscription: user?.Settings?.subscription_active || false,
                  subscription_price: user?.Settings?.subscription_price || 0,
                  subscription_duration:
                    user?.Settings?.subscription_duration || 0,
                  price_per_message: user?.Settings?.price_per_message || 0,
                  enable_free_message:
                    user?.Settings?.enable_free_message || false,
                }}
              >
                <Settingsbilling />
              </SettingsBillingProvider>
            </TabPanel>
            <TabPanel>
              <SettingsAutomatedMessage />
            </TabPanel>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default SettingsTab;
