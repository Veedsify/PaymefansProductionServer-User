"use client";
import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { LucideArrowRight, LucidePlay, X } from "lucide-react";
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
      <div className="max-w-[550px] lg:mx-auto mx-2 sm:mx-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-100 dark:shadow-gray-900/20 overflow-hidden py-6 rounded-2xl lg:rounded-2xl sm:rounded-xl backdrop-blur-sm min-h-[70vh] sm:min-h-0">
        {media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 dark:text-gray-300">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-dark-pink/20 to-purple-500/20">
              <svg
                className="w-8 h-8 text-primary-dark-pink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <p className="font-medium text-gray-500 dark:text-gray-400">
              No media selected
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Upload photos or videos to create your story
            </p>
          </div>
        ) : (
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-3 gap-4 mb-6 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {media.map((data: any) => (
                <div key={data.id} className="group">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 w-full aspect-square rounded-xl flex items-center justify-center relative ring-2 ring-transparent group-hover:ring-primary-dark-pink/30 transition-all duration-300 transform group-hover:scale-[1.02] shadow-md hover:shadow-lg">
                    <button
                      onClick={getRemoveHandler(data.id)}
                      className="absolute cursor-pointer z-50 top-2 right-2 bg-red-500 hover:bg-red-600 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 hover:scale-100"
                    >
                      <X strokeWidth={2.5} stroke="#fff" size={14} />
                    </button>
                    {data.media_type === "video" ? (
                      <>
                        <HLSVideoPlayer
                          streamUrl={data.media_url}
                          modalOpen={false}
                          allOthers={{ muted: true }}
                          className="inset-0 object-cover w-full h-full cursor-pointer duration-300 ease-in-out rounded-xl"
                        />
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-primary-dark-pink to-purple-600 p-1.5 rounded-full shadow-lg backdrop-blur-sm">
                          <LucidePlay fill="#fff" strokeWidth={0} size={12} />
                        </span>
                      </>
                    ) : (
                      <Image
                        src={data.media_url}
                        alt="media"
                        fill
                        sizes="(max-width: 640px) 100vw, 640px"
                        className="object-cover cursor-pointer duration-300 ease-in-out rounded-xl group-hover:brightness-110"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmitStory}
                className="flex items-center justify-center px-6 py-3 font-medium text-white rounded-full shadow-lg gap-3 transition-all duration-200 transform group bg-gradient-to-r from-primary-dark-pink to-purple-600 hover:from-primary-dark-pink/90 hover:to-purple-600/90 hover:shadow-xl hover:scale-105"
              >
                <span className="hidden text-sm sm:block">Continue</span>
                <LucideArrowRight
                  size={18}
                  strokeWidth={2.5}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                />
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
      <div className="border-t border-gray-200 dark:border-gray-700 max-w-[550px] lg:mx-auto mx-2 sm:mx-4 relative bottom-0 left-0 z-20 bg-white dark:bg-gray-800 w-full transition-all duration-300 ease-in-out rounded-b-2xl lg:rounded-b-2xl sm:rounded-b-xl">
        <div className="flex flex-col h-[70vh] sm:h-[560px] relative dark:text-white">
          <div className="sticky top-0 z-10 flex items-center p-1 m-2 text-center rounded-t-lg bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={() => handleSetTab("new")}
              className={`flex-1 cursor-pointer duration-300 transition-all rounded-md ${
                activeTab === "new"
                  ? "bg-white dark:bg-gray-800 text-primary-dark-pink shadow-sm font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <span className="block px-4 py-3 text-base font-medium sm:text-sm">
                New Upload
              </span>
            </button>
            <button
              onClick={() => handleSetTab("media")}
              className={`flex-1 cursor-pointer duration-300 transition-all rounded-md ${
                activeTab === "media"
                  ? "bg-white dark:bg-gray-800 text-primary-dark-pink shadow-sm font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <span className="block px-4 py-3 text-base font-medium sm:text-sm">
                My Media
              </span>
            </button>
          </div>
          <div className="h-full p-2 overflow-hidden">
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
