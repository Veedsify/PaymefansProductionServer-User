"use client";
import {
  LucideImage,
  LucideLock,
  LucidePodcast,
  LucideRepeat2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { ProfileUserProps } from "@/features/user/types/user";
import dynamic from "next/dynamic";

const MediaPanelOther = dynamic(
  () => import("@/features/media/MediaPanelOther"),
  { ssr: true }
);
const PostPanelOther = dynamic(() => import("@/features/post/PostPanelOther"), {
  ssr: true,
});
const PrivatePanelOther = dynamic(() => import("./PrivatePanelOther"), {
  ssr: true,
});
const RepostPanel = dynamic(() => import("./RepostPanel"), {
  ssr: true,
});

const ProfileTabsOther = ({ userdata }: { userdata: ProfileUserProps }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { isGuest } = useAuthContext();
  const { toggleModalOpen } = useGuestModal();

  const tabs = [
    {
      icon: <LucidePodcast strokeWidth={2} className="h-5  md:h-6" />,
      label: "Posts",
      content: <PostPanelOther userdata={userdata} />,
    },
    {
      icon: <LucideImage strokeWidth={2} className="h-5  md:h-6" />,
      label: "Media",
      content: !isGuest && <MediaPanelOther userdata={userdata} />,
    },
    {
      icon: <LucideRepeat2 strokeWidth={2} className="h-5  md:h-6" />,
      label: "Reposts",
      content: !isGuest && <RepostPanel userdata={userdata} />,
    },
    {
      icon: <LucideLock strokeWidth={2} className="h-5  md:h-6" />,
      label: "Private",
      content: !isGuest && <PrivatePanelOther userdata={userdata} />,
    },
  ];

  const handleTabClick = useCallback(
    (index: number) => {
      if (isGuest && index !== 0) {
        toggleModalOpen();
        return;
      }
      if (index !== activeTab) {
        setActiveTab(index);
        return;
      }
    },
    [isGuest, activeTab, toggleModalOpen]
  );

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
              onClick={() => handleTabClick(index)}
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

export default ProfileTabsOther;
