"use client";
import { useState } from "react";
import PostPanel from "@/features/post/PostPanel";
import MediaPanel from "@/features/media/MediaPanel";
import RepostPanel from "./RepostPanel";
import {
  LucideImage,
  LucideLock,
  LucidePodcast,
  LucideRepeat2,
} from "lucide-react";
import PrivatePanel from "./PrivatePanel";

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      icon: <LucidePodcast strokeWidth={2} className="h-5  md:h-6" />,
      label: "Posts",
      content: <PostPanel />,
    },
    {
      icon: <LucideImage strokeWidth={2} className="h-5  md:h-6" />,
      label: "Media",
      content: <MediaPanel />,
    },
    {
      icon: <LucideRepeat2 strokeWidth={2} className="h-5  md:h-6" />,
      label: "Reposts",
      content: <RepostPanel />,
    },
    {
      icon: <LucideLock strokeWidth={2} className="h-5  md:h-6" />,
      label: "Private",
      content: <PrivatePanel />,
    },
  ];

  return (
    <div className="relative px-3 md:px-5">
      {/* Tab List */}
      <div className={"relative"}>
        <div className="relative flex items-center text-center border-b border-black/30 dark:border-slate-600 dark:text-white">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`flex-1 outline-none cursor-pointer py-4 transition-colors dark:text-white ${
                activeTab === index
                  ? "text-primary-dark-pink"
                  : "text-black hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab(index)}
            >
              <span className="inline-flex flex-col items-center justify-center gap-1">
                <span className="flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden text-sm font-medium sm:inline-block">
                    {tab.label}
                  </span>
                </span>
              </span>
            </button>
          ))}
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
      <div className="mt-4">{tabs[activeTab].content}</div>
    </div>
  );
};

export default ProfileTabs;
