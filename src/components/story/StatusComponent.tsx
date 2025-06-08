"use client";
import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { LucideArrowRight, LucidePlay, X } from "lucide-react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import StoryUploadForm from "../sub_components/StoryUploadForm";
import StoryCaptionComponent from "./StoryCaptionComponent";
import StatusMediaPanel from "@/components/story/StatusMediaPanel";
import type { SelectMoreProps } from "@/types/Components";
import { useStoryStore } from "../../contexts/StoryContext";

// Dynamically import HLSVideoPlayer to reduce initial load bundle
const HLSVideoPlayer = dynamic(() => import("../sub_components/videoplayer"), {
  ssr: false,
});

function StatusComponent() {
  const [openMore, setOpenMore] = useState(true);
  const [openStoryCaption, setStoryCaption] = useState(false);
  const { story, removeFromStory } = useStoryStore();

  const media = useMemo(() => story, [story]);

  const toggleOpenMore = useCallback(() => {
    setOpenMore((prev) => !prev);
  }, []);

  const closeStoryComponent = useCallback(() => {
    setStoryCaption(false);
  }, []);

  const handleSubmitStory = useCallback(() => {
    if (media.length > 0) {
      setStoryCaption(true);
    }
  }, [media]);

  // Memoized removal handler creator to avoid inline functions in render
  const getRemoveHandler = useCallback(
    (id: number) => () => removeFromStory(id),
    [removeFromStory]
  );

  return (
    <>
      <div className="max-w-[550px] mx-auto border border-black/30 dark:border-gray-600 overflow-hidden py-5 rounded-lg">
        {media.length === 0 ? (
          <div className="flex items-center justify-center dark:text-white gap-3 pb-4">
            No media selected
          </div>
        ) : (
          <div className="p-3 md:p-5">
            <div className="grid grid-cols-3 gap-3 mb-3 p-1 overflow-y-auto">
              {media.map((data: any) => (
                <div key={data.id}>
                  <div className="bg-gray-200 w-full aspect-square rounded-lg flex items-center justify-center relative outline-2 duration-500 outline-primary-dark-pink">
                    <button
                      onClick={getRemoveHandler(data.id)}
                      className="absolute cursor-pointer z-50 top-0 right-0 bg-red-500 p-1 rounded-full m-1 shadow-white"
                    >
                      <X strokeWidth={2} stroke="#fff" />
                    </button>
                    {data.media_type === "video" ? (
                      <>
                        <HLSVideoPlayer
                          streamUrl={data.media_url}
                          modalOpen={false}
                          allOthers={{ muted: true }}
                          className="object-cover rounded-xl cursor-pointer ease-in-out duration-300 inset-0 w-full h-full"
                        />
                        <span className="absolute top-0 left-0 bg-primary-dark-pink p-1 rounded-full m-1 shadow-lg shadow-white">
                          <LucidePlay fill="#fff" strokeWidth={0} size={15} />
                        </span>
                      </>
                    ) : (
                      <Image
                        src={data.media_url}
                        alt="media"
                        fill
                        sizes="(max-width: 640px) 100vw, 640px"
                        className="object-cover ease-in-out duration-300 cursor-pointer rounded-xl"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <button
                onClick={handleSubmitStory}
                className="flex items-center justify-center gap-3 p-2 md:p-4 bg-primary-dark-pink text-white rounded-full ml-auto"
              >
                <LucideArrowRight size={20} strokeWidth={4} />
              </button>
            </div>
          </div>
        )}
        <SelectMoreItems openMore={openMore} handleOpenMore={toggleOpenMore} />
      </div>
      {openStoryCaption && (
        <StoryCaptionComponent close={closeStoryComponent} />
      )}
    </>
  );
}

const SelectMoreItems = React.memo(
  ({ openMore, handleOpenMore }: SelectMoreProps) => {
    const [activeTab, setActiveTab] = useState<"new" | "media">("new");

    const handleSetTab = useCallback((tab: "new" | "media") => {
      setActiveTab(tab);
    }, []);

    return (
      <div className="border-t border-black/30 dark:border-gray-700 max-w-[550px] relative mx-auto bottom-0 left-0 z-20 dark:bg-gray-900 bg-white w-full transition-all duration-300 ease-in-out">
        <div className="flex flex-col h-[560px] relative dark:bg-gray-900 dark:text-white">
          <div className="flex items-center text-center">
            <button
              onClick={() => handleSetTab("new")}
              className={`flex-1 cursor-pointer duration-300 transition-all ${
                activeTab === "new"
                  ? "bg-coins-card-bottom dark:text-black"
                  : ""
              }`}
            >
              <span className="block p-1 md:p-2 text-sm font-medium">New</span>
            </button>
            <button
              onClick={() => handleSetTab("media")}
              className={`flex-1 cursor-pointer duration-300 transition-all ${
                activeTab === "media"
                  ? "bg-coins-card-bottom dark:text-black"
                  : ""
              }`}
            >
              <span className="block p-1 md:p-2 text-sm font-medium">
                My Media
              </span>
            </button>
          </div>
          <div className="h-full">
            {activeTab === "new" && <StoryUploadForm />}
            {activeTab === "media" && <StatusMediaPanel />}
          </div>
        </div>
      </div>
    );
  }
);

SelectMoreItems.displayName = "SelectMoreItems";

export default React.memo(StatusComponent);
