"use client";
import { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {
  LucideImage,
  LucideLock,
  LucidePodcast,
  LucideRepeat2,
} from "lucide-react";
import PostPanelOther from "../post/PostPanelOther";
import MediaPanelOther from "../media/MediaPanelOther";
import { ProfileUserProps } from "@/types/User";
import RepostPanel from "./RepostPanel";
import PostPanel from "@/components/post/PostPanel";
import MediaPanel from "@/components/media/MediaPanel";
import PrivatePanelOther from "./PrivatePanelOther";
import { AnimatePresence } from "framer-motion";
const ProfileTabsOther = ({ userdata }: { userdata: ProfileUserProps }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      icon: <LucidePodcast size={24} />,
      label: "Posts",
      content: <PostPanelOther userdata={userdata} />,
    },
    {
      icon: <LucideImage size={24} />,
      label: "Media",
      content: <MediaPanelOther userdata={userdata} />,
    },
    {
      icon: <LucideRepeat2 size={24} />,
      label: "Reposts",
      content: <RepostPanel userdata={userdata} />,
    },
    {
      icon: <LucideLock size={24} />,
      label: "Private",
      content: <PrivatePanelOther userdata={userdata} />,
    },
  ];

  return (
    <div className="px-3 md:px-5 relative">
      {/* Tab List */}
      <div className={"relative"}>
        <div className="flex items-center text-center border-b border-black/30 dark:border-slate-600 dark:text-white relative">
          <AnimatePresence>
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`flex-1 outline-none cursor-pointer py-4 transition-colors ${
                  activeTab === index
                    ? "text-primary-dark-pink"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab(index)}
              >
                <span className="inline-flex flex-col items-center justify-center gap-1">
                  <span className="flex items-center gap-2">
                    {tab.icon}
                    <span className="text-sm font-medium hidden sm:inline-block">
                      {tab.label}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </AnimatePresence>
        </div>

        {/* Active Indicator */}
        <div
          className={`absolute bottom-0 h-[2px] bg-primary-dark-pink transition-all duration-300`}
          style={{
            width: `${100 / tabs.length}%`,
            left: `${(activeTab * 100) / tabs.length}%`,
          }}
        ></div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        <AnimatePresence>{tabs[activeTab].content}</AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileTabsOther;
