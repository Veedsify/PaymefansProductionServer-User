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

const SettingsTab = ({ user }: { user: AuthUserProps | null }) => {
  const searchParams = useSearchParams();
  const { user: authuser } = useUserAuthContext();
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
        <TabList className="flex gap-9 mb-4 border-b border-black/30 dark:border-white/30">
          <Tab>
            <button
              onClick={handleClick}
              data-tab="profile"
              className="text-black dark:text-white font-bold py-2 cursor-pointer"
            >
              Profile
            </button>
          </Tab>
          <Tab>
            <button
              onClick={handleClick}
              data-tab="security"
              className="text-black dark:text-white font-bold py-2 cursor-pointer"
            >
              Security
            </button>
          </Tab>
          {authuser?.is_model &&
            authuser.Model?.verification_status === true && (
              <>
                <Tab>
                  <button
                    onClick={handleClick}
                    data-tab="billing"
                    className="text-black dark:text-white font-bold py-2 cursor-pointer"
                  >
                    Billing
                  </button>
                </Tab>
                <Tab>
                  <button
                    onClick={handleClick}
                    data-tab="automated_messages"
                    className="text-black dark:text-white font-bold py-2 cursor-pointer"
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
        {authuser?.is_model && authuser.Model?.verification_status === true && (
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
