"use client"
import { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { LucideImage, LucideLock, LucidePodcast, LucideRepeat2 } from "lucide-react";
import PostPanelOther from "./postpanelother";
import MediaPanelOther from "./mediapanelother";
import { ProfileUserProps } from "@/types/user";
import RepostPanel from "./repost_panel";
const ProfileTabsOther = ({ userdata }: { userdata: ProfileUserProps }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <div className="">
      <Tabs
        selectedIndex={selectedTab}
        className="px-3 md:px-5"
        onSelect={(index) => setSelectedTab(index)}
      >
   <TabList className="flex items-center text-center border-b dark:border-slate-600 dark:text-white">
          <Tab className="flex-1 outline-none cursor-pointer">
            <span className="inline-flex items-center justify-center mb-2 text-sm font-medium">
              <LucidePodcast size={24} />
            </span>
            <span
              className={` block h-[2px] w-full rounded-lg ${selectedTab === 0 ? "bg-primary-dark-pink" : ""
                }`}
            ></span>
          </Tab>
          <Tab className="flex-1 text-center outline-none cursor-pointer">
            <span className="inline-flex items-center justify-center mb-2 text-sm font-medium">
              <LucideImage size={24} />
            </span>
            <span
              className={` block h-[2px] w-full rounded-lg ${selectedTab === 1 ? "bg-primary-dark-pink" : ""
                }`}
            ></span>
          </Tab>
          <Tab className="flex-1 text-center outline-none cursor-pointer">
            <span className="inline-flex items-center justify-center mb-2 text-sm font-medium">
              <LucideRepeat2 size={24} />
            </span>
            <span
              className={` block h-[2px] w-full rounded-lg ${selectedTab === 2 ? "bg-primary-dark-pink" : ""
                }`}
            ></span>
          </Tab>
          <Tab className="flex-1 outline-none cursor-pointer">
            <span className="inline-flex items-center justify-center mb-2 text-sm font-medium whitespace-nowrap">
              <LucideLock size={24} />
            </span>
            <span
              className={` block h-[2px] w-full rounded-lg ${selectedTab === 3 ? "bg-primary-dark-pink" : ""
                }`}
            ></span>
          </Tab>
        </TabList>
        <TabPanel>
          <PostPanelOther
            userdata={userdata}
          />
        </TabPanel>
        <TabPanel>
          <MediaPanelOther
            userdata={userdata}
          />
        </TabPanel>
        <TabPanel>
          <RepostPanel userdata={userdata} />
        </TabPanel>
        <TabPanel>
          <div className="py-8">
            <p>four!</p>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default ProfileTabsOther;
